import { Button, Card, Drawer, Input, Skeleton, Space, Table } from 'antd'
import { useMemo, useState } from 'react'
import { useCourseStudentsQuery, useTeacherCoursesQuery } from '../../features/teacher/teacherApi'

export function TeacherDashboardPage() {
  const { data, isLoading } = useTeacherCoursesQuery()
  const rows = data?.data ?? []
  const [courseId, setCourseId] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')

  const studentsQueryArg = useMemo(
    () => (courseId ? { courseId, keyword: keyword.trim() || undefined } : (undefined as any)),
    [courseId, keyword],
  )
  const { data: studentsData, isFetching: isStudentsLoading } = useCourseStudentsQuery(
    studentsQueryArg,
    { skip: !courseId },
  )

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="glass-card rounded-2xl" bordered={false}>
        <div className="text-slate-900 font-semibold">我的课程</div>
        <div className="text-slate-500 mt-1 text-sm">点击“学生名单”查看与导出CSV。</div>
      </Card>

      <Card className="glass-card rounded-2xl" bordered={false}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            rowKey="id"
            dataSource={rows}
            columns={[
              { title: '课程名', dataIndex: 'name' },
              { title: '上课时间', dataIndex: 'schedule' },
              {
                title: '学生人数',
                render: (_, r) => `${r.enrolled}/${r.capacity}`,
              },
              {
                title: '操作',
                render: (_, r) => (
                  <Space>
                    <Button onClick={() => setCourseId(r.id)}>学生名单</Button>
                    <Button
                      type="link"
                      onClick={() => {
                        const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
                        window.open(`${base}/api/teacher/courses/${r.id}/export`, '_blank')
                      }}
                    >
                      导出CSV
                    </Button>
                  </Space>
                ),
              },
            ]}
            pagination={false}
          />
        )}
      </Card>

      <Drawer title="学生名单" open={!!courseId} onClose={() => setCourseId(null)} width={520}>
        <Input.Search
          allowClear
          placeholder="按学号/姓名搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="mt-4">
          {isStudentsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Table
              rowKey="id"
              dataSource={studentsData?.data ?? []}
              columns={[
                { title: '姓名', dataIndex: 'name' },
                { title: '学号', dataIndex: 'studentId' },
                { title: '邮箱', dataIndex: 'email' },
              ]}
              pagination={false}
              size="small"
            />
          )}
        </div>
      </Drawer>
    </div>
  )
}

