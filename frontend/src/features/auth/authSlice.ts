import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type AuthUser = {
  id: number
  role: Role
  email: string
  name: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

const STORAGE_KEY = 'scs.auth'

function loadInitial(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { accessToken: null, refreshToken: null, user: null }
    const parsed = JSON.parse(raw) as AuthState
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    }
  } catch {
    return { accessToken: null, refreshToken: null, user: null }
  }
}

function persist(state: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const initialState: AuthState = loadInitial()

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        user: AuthUser
      }>,
    ) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      persist(state)
    },
    clearAuth(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      persist(state)
    },
  },
})

export const authReducer = slice.reducer
export const { setAuth, clearAuth } = slice.actions

export const selectAccessToken = (s: RootState) => s.auth.accessToken
export const selectUser = (s: RootState) => s.auth.user
export const selectRole = (s: RootState) => s.auth.user?.role ?? null

