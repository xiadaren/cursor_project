import { apiSlice } from '../../app/api/apiSlice'

export type ApiResponse<T> = { success: boolean; data: T; error?: any }

export type AdminDashboardDto = {
  courseCount: number
  studentCount: number
  teacherCount: number
  currentEnrollmentCount: number
}

export type AdminCourseDto = {
  id: number
  name: string
  teacherId: number
  teacherName: string
  credits: number
  capacity: number
  enrolled: number
  schedule: string
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
  location: string
  description: string | null
}

export type AdminUserDto = {
  id: number
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  email: string
  name: string
  studentId?: string | null
  teacherId?: string | null
}

export type SemesterDto = {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export type EnrollmentWindowDto = {
  id: number
  semesterId: number
  startAt: string
  endAt: string
} | null

export type AuditLogDto = {
  id: number
  actorUserId: number | null
  action: string
  detail: string | null
  createdAt: string
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    adminDashboard: build.query<ApiResponse<AdminDashboardDto>, void>({
      query: () => ({ url: '/api/admin/dashboard' }),
      providesTags: ['Admin'],
    }),
    adminCourses: build.query<ApiResponse<AdminCourseDto[]>, { keyword?: string } | void>({
      query: (arg) => ({ url: '/api/admin/courses', params: arg as any }),
      providesTags: ['Courses'],
    }),
    createCourse: build.mutation<ApiResponse<AdminCourseDto>, any>({
      query: (body) => ({ url: '/api/admin/courses', method: 'POST', data: body }),
      invalidatesTags: ['Courses', 'Admin'],
    }),
    updateCourse: build.mutation<ApiResponse<AdminCourseDto>, { id: number; body: any }>({
      query: ({ id, body }) => ({ url: `/api/admin/courses/${id}`, method: 'PUT', data: body }),
      invalidatesTags: ['Courses', 'Admin'],
    }),
    deleteCourse: build.mutation<ApiResponse<null>, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Courses', 'Admin'],
    }),
    adminUsers: build.query<ApiResponse<AdminUserDto[]>, { role: string }>({
      query: (arg) => ({ url: '/api/admin/users', params: arg }),
      providesTags: ['Admin'],
    }),
    createUser: build.mutation<ApiResponse<AdminUserDto>, any>({
      query: (body) => ({ url: '/api/admin/users', method: 'POST', data: body }),
      invalidatesTags: ['Admin'],
    }),
    resetPassword: build.mutation<ApiResponse<null>, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/users/${id}/reset-password`, method: 'POST' }),
      invalidatesTags: ['Admin'],
    }),
    semesters: build.query<ApiResponse<SemesterDto[]>, void>({
      query: () => ({ url: '/api/admin/semesters' }),
      providesTags: ['Admin'],
    }),
    createSemester: build.mutation<ApiResponse<SemesterDto>, any>({
      query: (body) => ({ url: '/api/admin/semesters', method: 'POST', data: body }),
      invalidatesTags: ['Admin'],
    }),
    activateSemester: build.mutation<ApiResponse<null>, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/semesters/${id}/activate`, method: 'PUT' }),
      invalidatesTags: ['Admin'],
    }),
    semesterWindow: build.query<ApiResponse<EnrollmentWindowDto>, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/semesters/${id}/window` }),
      providesTags: ['Admin'],
    }),
    upsertSemesterWindow: build.mutation<ApiResponse<EnrollmentWindowDto>, { id: number; startAt: string; endAt: string }>({
      query: ({ id, ...body }) => ({
        url: `/api/admin/semesters/${id}/window`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Admin'],
    }),
    logs: build.query<ApiResponse<AuditLogDto[]>, void>({
      query: () => ({ url: '/api/admin/logs' }),
      providesTags: ['Admin'],
    }),
  }),
})

export const {
  useAdminDashboardQuery,
  useAdminCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAdminUsersQuery,
  useCreateUserMutation,
  useResetPasswordMutation,
  useSemestersQuery,
  useCreateSemesterMutation,
  useActivateSemesterMutation,
  useSemesterWindowQuery,
  useUpsertSemesterWindowMutation,
  useLogsQuery,
} = adminApi

