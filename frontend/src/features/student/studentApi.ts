import { apiSlice } from '../../app/api/apiSlice'

export type ApiResponse<T> = { success: boolean; data: T; error?: any }

export type DashboardDto = {
  semesterName: string
  totalCredits: number
  enrollmentOpen: boolean
  enrollmentEndAt: string
}

export type CourseCardDto = {
  id: number
  name: string
  teacherName: string
  credits: number
  capacity: number
  enrolled: number
  schedule: string
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
  location: string
  selected: boolean
}

export type CourseDetailDto = {
  id: number
  name: string
  teacherName: string
  credits: number
  capacity: number
  enrolled: number
  schedule: string
  location: string
  description: string | null
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
}

export type ScheduleCourseDto = {
  courseId: number
  name: string
  teacherName: string
  credits: number
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
  location: string
  schedule: string
}

export type NotificationDto = {
  id: number
  content: string
  isRead: boolean
  createdAt: string
}

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    studentDashboard: build.query<ApiResponse<DashboardDto>, void>({
      query: () => ({ url: '/api/student/dashboard' }),
      providesTags: ['Me'],
    }),
    courses: build.query<
      ApiResponse<CourseCardDto[]>,
      { keyword?: string; credits?: number } | void
    >({
      query: (arg) => ({
        url: '/api/courses',
        params: arg && 'keyword' in arg ? { keyword: arg.keyword, credits: arg.credits } : undefined,
      }),
      providesTags: ['Courses'],
    }),
    courseDetail: build.query<ApiResponse<CourseDetailDto>, { id: number }>({
      query: ({ id }) => ({ url: `/api/courses/${id}` }),
    }),
    enroll: build.mutation<ApiResponse<null>, { courseId: number }>({
      query: (body) => ({ url: '/api/enrollments', method: 'POST', data: body }),
      invalidatesTags: ['Courses', 'Enrollments', 'Notifications', 'Me'],
    }),
    drop: build.mutation<ApiResponse<null>, { courseId: number }>({
      query: ({ courseId }) => ({ url: `/api/enrollments/${courseId}`, method: 'DELETE' }),
      invalidatesTags: ['Courses', 'Enrollments', 'Notifications', 'Me'],
    }),
    myEnrollments: build.query<ApiResponse<ScheduleCourseDto[]>, void>({
      query: () => ({ url: '/api/student/enrollments' }),
      providesTags: ['Enrollments'],
    }),
    schedule: build.query<ApiResponse<ScheduleCourseDto[]>, void>({
      query: () => ({ url: '/api/student/schedule' }),
      providesTags: ['Enrollments'],
    }),
    notifications: build.query<ApiResponse<NotificationDto[]>, void>({
      query: () => ({ url: '/api/student/notifications' }),
      providesTags: ['Notifications'],
    }),
    markRead: build.mutation<ApiResponse<null>, { id: number }>({
      query: ({ id }) => ({ url: `/api/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
})

export const {
  useStudentDashboardQuery,
  useCoursesQuery,
  useCourseDetailQuery,
  useEnrollMutation,
  useDropMutation,
  useMyEnrollmentsQuery,
  useScheduleQuery,
  useNotificationsQuery,
  useMarkReadMutation,
} = studentApi

