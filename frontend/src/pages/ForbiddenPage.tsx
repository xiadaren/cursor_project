import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <Result
        status="403"
        title="403"
        subTitle="你没有权限访问该页面"
        extra={
          <Button type="primary">
            <Link to="/login">切换账号</Link>
          </Button>
        }
      />
    </div>
  )
}

