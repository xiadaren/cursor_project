import { apiSlice } from '../../app/api/apiSlice'

export type ApiResponse<T> = { success: boolean; data: T; error?: any }

export type TeacherCourseDto = {
  id: number
  name: string
  schedule: string
  enrolled: number
  capacity: number
}

export type StudentDto = {
  id: number
  name: string
  studentId: string | null
  email: string
}

export const teacherApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    teacherCourses: build.query<ApiResponse<TeacherCourseDto[]>, void>({
      query: () => ({ url: '/api/teacher/courses' }),
      providesTags: ['TeacherCourses'],
    }),
    courseStudents: build.query<ApiResponse<StudentDto[]>, { courseId: number; keyword?: string }>({
      query: ({ courseId, keyword }) => ({
        url: `/api/teacher/courses/${courseId}/students`,
        params: keyword ? { keyword } : undefined,
      }),
    }),
  }),
})

export const { useTeacherCoursesQuery, useCourseStudentsQuery } = teacherApi

