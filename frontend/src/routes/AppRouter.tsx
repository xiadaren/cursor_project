import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { CoursesPage } from '../pages/student/CoursesPage'
import { EnrollmentsPage } from '../pages/student/EnrollmentsPage'
import { SchedulePage } from '../pages/student/SchedulePage'
import { NotificationsPage } from '../pages/student/NotificationsPage'
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminCoursesPage } from '../pages/admin/AdminCoursesPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { AdminSemestersPage } from '../pages/admin/AdminSemestersPage'
import { AdminLogsPage } from '../pages/admin/AdminLogsPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          <Route element={<AppLayout />}>
            <Route element={<RequireAuth allow={['STUDENT']} />}>
              <Route path="/student" element={<StudentDashboardPage />} />
              <Route path="/student/courses" element={<CoursesPage />} />
              <Route path="/student/enrollments" element={<EnrollmentsPage />} />
              <Route path="/student/schedule" element={<SchedulePage />} />
              <Route path="/student/notifications" element={<NotificationsPage />} />
            </Route>
            <Route element={<RequireAuth allow={['TEACHER']} />}>
              <Route path="/teacher" element={<TeacherDashboardPage />} />
            </Route>
            <Route element={<RequireAuth allow={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/semesters" element={<AdminSemestersPage />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

