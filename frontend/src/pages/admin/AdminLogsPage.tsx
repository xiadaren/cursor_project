import { Card, Skeleton, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useLogsQuery } from '../../features/admin/adminApi'

export function AdminLogsPage() {
  const { data, isLoading } = useLogsQuery()
  const rows = data?.data ?? []

  return (
    <Card className="glass-card rounded-2xl" bordered={false}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={false}
          columns={[
            { title: '时间', dataIndex: 'createdAt', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss') },
            { title: '动作', dataIndex: 'action', render: (v) => <Tag color="blue">{v}</Tag> },
            { title: '详情', dataIndex: 'detail' },
            { title: '操作者', dataIndex: 'actorUserId' },
          ]}
        />
      )}
    </Card>
  )
}

