import { Button, Card, DatePicker, Form, Modal, Skeleton, Space, Table, Tag, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import {
  useActivateSemesterMutation,
  useSemestersQuery,
  useSemesterWindowQuery,
  useUpsertSemesterWindowMutation,
} from '../../features/admin/adminApi'

export function AdminSemestersPage() {
  const { data, isLoading } = useSemestersQuery()
  const rows = data?.data ?? []
  const [activate, { isLoading: isActivating }] = useActivateSemesterMutation()

  const [windowSemesterId, setWindowSemesterId] = useState<number | null>(null)
  const [form] = Form.useForm<{ startAt: Dayjs; endAt: Dayjs }>()
  const { data: windowData, isFetching: isWindowLoading } = useSemesterWindowQuery(
    windowSemesterId ? { id: windowSemesterId } : (undefined as any),
    { skip: !windowSemesterId },
  )
  const existingWindow = windowData?.data ?? null

  const [saveWindow, { isLoading: isSaving }] = useUpsertSemesterWindowMutation()

  const activeSemesterId = useMemo(() => rows.find((r) => r.isActive)?.id ?? null, [rows])

  useEffect(() => {
    if (!windowSemesterId) return
    const startAt = existingWindow ? dayjs(existingWindow.startAt) : dayjs().startOf('day')
    const endAt = existingWindow ? dayjs(existingWindow.endAt) : dayjs().add(7, 'day').endOf('day')
    form.setFieldsValue({ startAt, endAt })
  }, [windowSemesterId, existingWindow, form])

  return (
    <div className="grid gap-4">
      <Card className="glass-card rounded-2xl" bordered={false}>
        <div className="text-slate-900 font-semibold">学期与周期</div>
        <div className="text-slate-500 text-sm mt-1">
          可激活当前学期，并为学期设置“选课开始/结束时间”（系统将自动控制选课开关）。
        </div>
      </Card>

      <Card className="glass-card rounded-2xl" bordered={false}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            rowKey="id"
            dataSource={rows}
            pagination={false}
            columns={[
              { title: '学期', dataIndex: 'name' },
              { title: '开始', dataIndex: 'startDate' },
              { title: '结束', dataIndex: 'endDate' },
              {
                title: '状态',
                render: (_, r) =>
                  r.isActive ? <Tag color="green">当前学期</Tag> : <Tag color="default">未激活</Tag>,
              },
              {
                title: '操作',
                render: (_, r) => (
                  <Space>
                    <Button
                      disabled={r.isActive}
                      loading={isActivating}
                      onClick={async () => {
                        try {
                          await activate({ id: r.id }).unwrap()
                          message.success('已激活学期')
                        } catch (e: any) {
                          message.error(e?.data?.error?.message ?? '操作失败')
                        }
                      }}
                    >
                      激活
                    </Button>
                    <Button
                      type={r.id === activeSemesterId ? 'primary' : 'default'}
                      onClick={() => {
                        setWindowSemesterId(r.id)
                      }}
                    >
                      设置选课周期
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        title="设置选课周期"
        open={!!windowSemesterId}
        onCancel={() => setWindowSemesterId(null)}
        okText="保存"
        cancelText="取消"
        confirmLoading={isSaving}
        onOk={async () => {
          try {
            const values = await form.validateFields()
            const id = windowSemesterId!
            await saveWindow({
              id,
              startAt: values.startAt.toISOString(),
              endAt: values.endAt.toISOString(),
            }).unwrap()
            message.success('已保存选课周期')
            setWindowSemesterId(null)
          } catch (e: any) {
            if (e?.errorFields) return
            message.error(e?.data?.error?.message ?? e?.message ?? '保存失败')
          }
        }}
      >
        {isWindowLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <>
            <div className="text-slate-500 text-sm mb-3">
              当前：{existingWindow ? `${dayjs(existingWindow.startAt).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(existingWindow.endAt).format('YYYY-MM-DD HH:mm')}` : '未设置'}
            </div>
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                label="开始时间"
                name="startAt"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
              <Form.Item
                label="结束时间"
                name="endAt"
                rules={[
                  { required: true, message: '请选择结束时间' },
                  ({ getFieldValue }) => ({
                    validator(_, value: Dayjs) {
                      const start = getFieldValue('startAt') as Dayjs
                      if (!start || !value) return Promise.resolve()
                      if (value.isAfter(start)) return Promise.resolve()
                      return Promise.reject(new Error('结束时间必须晚于开始时间'))
                    },
                  }),
                ]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  )
}

