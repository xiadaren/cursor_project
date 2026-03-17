import { Layout, Menu } from 'antd'
import {
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  NotificationOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectRole } from '../../features/auth/authSlice'

const { Sider } = Layout

export function Sidebar() {
  const role = useAppSelector(selectRole)
  const location = useLocation()

  const items =
    role === 'ADMIN'
      ? [
          { key: '/admin', icon: <AppstoreOutlined />, label: <Link to="/admin">仪表盘</Link> },
          {
            key: '/admin/courses',
            icon: <BookOutlined />,
            label: <Link to="/admin/courses">课程管理</Link>,
          },
          { key: '/admin/users', icon: <TeamOutlined />, label: <Link to="/admin/users">用户管理</Link> },
          {
            key: '/admin/semesters',
            icon: <CalendarOutlined />,
            label: <Link to="/admin/semesters">学期与周期</Link>,
          },
          { key: '/admin/logs', icon: <SettingOutlined />, label: <Link to="/admin/logs">系统日志</Link> },
        ]
      : role === 'TEACHER'
        ? [
            { key: '/teacher', icon: <BookOutlined />, label: <Link to="/teacher">我的课程</Link> },
            { key: '/teacher/profile', icon: <SettingOutlined />, label: '个人设置' },
          ]
        : [
            { key: '/student', icon: <AppstoreOutlined />, label: <Link to="/student">仪表盘</Link> },
            {
              key: '/student/courses',
              icon: <BookOutlined />,
              label: <Link to="/student/courses">课程浏览</Link>,
            },
            {
              key: '/student/enrollments',
              icon: <BookOutlined />,
              label: <Link to="/student/enrollments">已选课程</Link>,
            },
            {
              key: '/student/schedule',
              icon: <CalendarOutlined />,
              label: <Link to="/student/schedule">课表</Link>,
            },
            {
              key: '/student/notifications',
              icon: <NotificationOutlined />,
              label: <Link to="/student/notifications">通知</Link>,
            },
            { key: '/student/profile', icon: <SettingOutlined />, label: '个人中心' },
          ]

  const selected = items.find((i) => location.pathname.startsWith(i.key))?.key

  return (
    <Sider
      width={248}
      className="glass-card m-4 rounded-2xl overflow-hidden"
      breakpoint="lg"
      collapsedWidth={72}
    >
      <div className="px-4 py-4 font-semibold text-slate-900">SCS</div>
      <Menu
        mode="inline"
        selectedKeys={selected ? [selected] : []}
        items={items}
        className="bg-transparent border-0"
      />
    </Sider>
  )
}

