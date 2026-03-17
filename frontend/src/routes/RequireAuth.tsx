import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectRole, selectAccessToken } from '../features/auth/authSlice'
import type { Role } from '../features/auth/authSlice'
import { useAppSelector } from '../app/hooks'

export function RequireAuth({ allow }: { allow: Role[] }) {
  const token = useAppSelector(selectAccessToken)
  const role = useAppSelector(selectRole)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!role || !allow.includes(role)) {
    return <Navigate to="/403" replace />
  }
  return <Outlet />
}

