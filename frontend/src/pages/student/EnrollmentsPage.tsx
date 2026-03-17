import { Button, Card, Skeleton, Table, Tag, message } from 'antd'
import { Modal } from 'antd'
import { useDropMutation, useMyEnrollmentsQuery } from '../../features/student/studentApi'

export function EnrollmentsPage() {
  const { data, isLoading } = useMyEnrollmentsQuery()
  const rows = data?.data ?? []
  const [drop, { isLoading: isDropping }] = useDropMutation()

  return (
    <Card className="glass-card rounded-2xl" bordered={false}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          rowKey="courseId"
          dataSource={rows}
          pagination={false}
          columns={[
            { title: '课程', dataIndex: 'name' },
            { title: '教师', dataIndex: 'teacherName' },
            { title: '学分', dataIndex: 'credits', render: (v) => <Tag color="blue">{v}</Tag> },
            { title: '时间', dataIndex: 'schedule' },
            { title: '地点', dataIndex: 'location' },
            {
              title: '操作',
              render: (_, r) => (
                <Button
                  danger
                  loading={isDropping}
                  onClick={() => {
                    Modal.confirm({
                      title: '确认退课？',
                      content: r.name,
                      okText: '确认',
                      okButtonProps: { danger: true },
                      cancelText: '取消',
                      onOk: async () => {
                        try {
                          await drop({ courseId: r.courseId }).unwrap()
                          message.success('退课成功')
                        } catch (e: any) {
                          message.error(e?.data?.error?.message ?? '退课失败')
                        }
                      },
                    })
                  }}
                >
                  退课
                </Button>
              ),
            },
          ]}
        />
      )}
    </Card>
  )
}

