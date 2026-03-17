import { Button, Card, List, Skeleton, Tag } from 'antd'
import dayjs from 'dayjs'
import { useMarkReadMutation, useNotificationsQuery } from '../../features/student/studentApi'

export function NotificationsPage() {
  const { data, isLoading } = useNotificationsQuery()
  const items = data?.data ?? []
  const [markRead, { isLoading: isMarking }] = useMarkReadMutation()

  return (
    <Card className="glass-card rounded-2xl" bordered={false}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(n) => (
            <List.Item
              actions={[
                n.isRead ? (
                  <Tag key="read" color="default">
                    已读
                  </Tag>
                ) : (
                  <Button
                    key="mark"
                    size="small"
                    loading={isMarking}
                    onClick={() => markRead({ id: n.id })}
                  >
                    标记已读
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                title={<span className="text-slate-900">{n.content}</span>}
                description={dayjs(n.createdAt).format('YYYY-MM-DD HH:mm')}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

