import { Card, Skeleton, Statistic } from 'antd'
import { BookOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { useAdminDashboardQuery } from '../../features/admin/adminApi'

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboardQuery()
  const dto = data?.data

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic title="课程总数" value={dto?.courseCount ?? 0} prefix={<BookOutlined />} />
          )}
        </Card>
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic title="学生人数" value={dto?.studentCount ?? 0} prefix={<TeamOutlined />} />
          )}
        </Card>
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic title="教师人数" value={dto?.teacherCount ?? 0} prefix={<UserOutlined />} />
          )}
        </Card>
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic title="当前选课人数" value={dto?.currentEnrollmentCount ?? 0} />
          )}
        </Card>
      </div>

      <Card className="glass-card rounded-2xl" bordered={false}>
        <div className="text-slate-900 font-semibold">管理员工具</div>
        <div className="text-slate-500 mt-1 text-sm">
          接下来会接入：课程CRUD、用户管理、学期与选课周期、系统日志与CSV导入。
        </div>
      </Card>
    </div>
  )
}

