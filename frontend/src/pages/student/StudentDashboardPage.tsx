import { Card, Skeleton, Statistic, Tag } from 'antd'
import { BookOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useStudentDashboardQuery } from '../../features/student/studentApi'

export function StudentDashboardPage() {
  const { data, isLoading } = useStudentDashboardQuery()
  const dto = data?.data

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic title="当前学期" value={dto?.semesterName ?? '-'} prefix={<CalendarOutlined />} />
          )}
        </Card>
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic title="已选学分" value={dto?.totalCredits ?? 0} prefix={<BookOutlined />} />
          )}
        </Card>
        <Card className="glass-card rounded-2xl" bordered={false}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <Statistic
              title="选课状态"
              valueRender={() => (
                <Tag color={dto?.enrollmentOpen ? 'green' : 'default'}>
                  {dto?.enrollmentOpen ? '开放' : '关闭'}
                </Tag>
              )}
              prefix={<ClockCircleOutlined />}
            />
          )}
        </Card>
      </div>

      <Card className="glass-card rounded-2xl" bordered={false}>
        <div className="text-slate-900 font-semibold">待办提醒</div>
        <div className="text-slate-500 mt-1 text-sm">
          {dto?.enrollmentEndAt
            ? `选课截止：${dayjs(dto.enrollmentEndAt).format('YYYY-MM-DD HH:mm')}`
            : '选课截止时间待设置'}
        </div>
      </Card>
    </div>
  )
}

