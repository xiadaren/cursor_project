import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { RootState } from '../store'
import { clearAuth, setAuth } from '../../features/auth/authSlice'

export type AxiosBaseQueryArgs = {
  url: string
  method?: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
}

export type ApiError = {
  status: number
  data: unknown
}

export function axiosBaseQuery(
  { baseUrl }: { baseUrl: string } = { baseUrl: '' },
): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> {
  return async ({ url, method = 'GET', data, params, headers }, api) => {
    try {
      const state = api.getState() as RootState
      const token = state.auth.accessToken
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        withCredentials: false,
      })
      return { data: result.data }
    } catch (err) {
      const error = err as AxiosError
      const status = error.response?.status

      // best-effort refresh on 401 once
      if (status === 401) {
        const state = api.getState() as RootState
        const refreshToken = state.auth.refreshToken
        if (refreshToken) {
          try {
            const refreshed = await axios.post(baseUrl + '/api/auth/refresh-token', { refreshToken })
            const payload = refreshed.data?.data
            if (payload?.accessToken && payload?.refreshToken && payload?.user) {
              api.dispatch(
                setAuth({
                  accessToken: payload.accessToken,
                  refreshToken: payload.refreshToken,
                  user: payload.user,
                }),
              )
              const retry = await axios({
                url: baseUrl + url,
                method,
                data,
                params,
                headers: {
                  Authorization: `Bearer ${payload.accessToken}`,
                  ...headers,
                },
                withCredentials: false,
              })
              return { data: retry.data }
            }
          } catch {
            api.dispatch(clearAuth())
          }
        } else {
          api.dispatch(clearAuth())
        }
      }
      return {
        error: {
          status: status ?? 500,
          data: error.response?.data ?? error.message,
        },
      }
    }
  }
}

