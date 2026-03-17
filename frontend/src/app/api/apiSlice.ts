import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axiosBaseQuery'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl }),
  tagTypes: ['Me', 'Courses', 'Enrollments', 'Notifications', 'TeacherCourses', 'Admin'],
  endpoints: () => ({}),
})

