import { Button, Layout, Space, Tag } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { clearAuth, selectUser } from '../../features/auth/authSlice'

const { Header, Content } = Layout

export function AppLayout() {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <Layout className="min-h-full bg-transparent">
      <Sidebar />
      <Layout className="bg-transparent">
        <Header className="glass-card mx-4 mt-4 rounded-2xl flex items-center justify-between">
          <div className="font-semibold text-slate-900">学生选课系统</div>
          <Space>
            {user ? (
              <>
                <Tag color="blue">{user.role}</Tag>
                <div className="text-slate-600 text-sm">{user.name}</div>
              </>
            ) : (
              <div className="text-slate-500 text-sm">前后端分离 · Ant Design · Tailwind</div>
            )}
            <Button
              size="small"
              onClick={() => {
                dispatch(clearAuth())
                navigate('/login', { replace: true })
              }}
            >
              退出
            </Button>
          </Space>
        </Header>
        <Content className="p-4 md:p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

