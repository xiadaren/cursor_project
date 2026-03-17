import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <Result
        status="404"
        title="404"
        subTitle="页面不存在"
        extra={
          <Button type="primary">
            <Link to="/login">回到登录</Link>
          </Button>
        }
      />
    </div>
  )
}

