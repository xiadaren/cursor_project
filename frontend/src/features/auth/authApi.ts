import { apiSlice } from '../../app/api/apiSlice'
import type { AuthUser } from './authSlice'

export type LoginRequest = { email: string; password: string }
export type LoginResponse = {
  success: boolean
  data: { accessToken: string; refreshToken: string; user: AuthUser }
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  studentId: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', data: body }),
    }),
    register: build.mutation<{ success: boolean }, RegisterRequest>({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', data: body }),
    }),
    refreshToken: build.mutation<LoginResponse, { refreshToken: string }>({
      query: (body) => ({
        url: '/api/auth/refresh-token',
        method: 'POST',
        data: body,
      }),
    }),
    me: build.query<{ success: boolean; data: AuthUser }, void>({
      query: () => ({
        url: '/api/users/profile',
        method: 'GET',
      }),
      providesTags: ['Me'],
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useRefreshTokenMutation } =
  authApi

