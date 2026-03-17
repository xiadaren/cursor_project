import { Button, Card, DatePicker, Form, Modal, Skeleton, Space, Table, Tag, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import {
    useActivateSemesterMutation,
    useSemestersQuery,
    useSemesterWindowQuery,
    useUpsertSemesterWindowMutation,
} from '../../features/admin/adminApi'

// 类型定义：避免any，提升代码健壮性
type SemesterWindow = {
    id?: number;
    startAt: string;
    endAt: string;
    semesterId: number;
};

export function AdminSemestersPage() {
    const { data, isLoading } = useSemestersQuery()
    const rows = data?.data ?? []
    const [activate, { isLoading: isActivating }] = useActivateSemesterMutation()

    const [windowSemesterId, setWindowSemesterId] = useState<number | null>(null)
    const [form] = Form.useForm<{ startAt: Dayjs; endAt: Dayjs }>()
    // 修复：参数类型匹配，skip逻辑正确
    const { data: windowData, isFetching: isWindowLoading } = useSemesterWindowQuery(
        windowSemesterId ? { id: windowSemesterId } : { id: 0 },
        { skip: !windowSemesterId },
    )
    const existingWindow = windowData?.data as SemesterWindow | null ?? null

    const [saveWindow, { isLoading: isSaving }] = useUpsertSemesterWindowMutation()

    const activeSemesterId = useMemo(() => rows.find((r) => r.isActive)?.id ?? null, [rows])

    // 优化初始值设置：避免旧值残留，确保初始值正确
    useEffect(() => {
        if (!windowSemesterId || !form) return

        form.resetFields()
        const initialValues = {
            startAt: existingWindow ? dayjs(existingWindow.startAt) : dayjs().startOf('day'),
            endAt: existingWindow ? dayjs(existingWindow.endAt) : dayjs().add(7, 'day').endOf('day'),
        }
        form.setFieldsValue(initialValues)
    }, [windowSemesterId, existingWindow, form])

    // 存储实时表单值，用于展示
    const [formValues, setFormValues] = useState<{ startAt: Dayjs; endAt: Dayjs }>({
        startAt: dayjs().startOf('day'),
        endAt: dayjs().add(7, 'day').endOf('day'),
    })

    // 格式化时间展示：优先用实时表单值，其次用后端数据，最后提示未设置
    const getDisplayTime = () => {
        if (formValues.startAt && formValues.endAt) {
            return `${formValues.startAt.format('YYYY-MM-DD HH:mm')} ~ ${formValues.endAt.format('YYYY-MM-DD HH:mm')}`
        }
        if (existingWindow) {
            return `${dayjs(existingWindow.startAt).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(existingWindow.endAt).format('YYYY-MM-DD HH:mm')}`
        }
        return '未设置'
    }

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
                                                } catch (e: unknown) {
                                                    const err = e as { data?: { error?: { message?: string } } }
                                                    message.error(err.data?.error?.message ?? '操作失败')
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
                onCancel={() => {
                    setWindowSemesterId(null)
                    form.resetFields()
                }}
                okText="保存"
                cancelText="取消"
                confirmLoading={isSaving}
                onOk={async () => {
                    try {
                        const values = await form.validateFields()
                        if (!windowSemesterId) return

                        if (!values.endAt.isAfter(values.startAt)) {
                            message.error('结束时间必须晚于开始时间')
                            return
                        }

                        await saveWindow({
                            id: windowSemesterId,
                            startAt: values.startAt.toISOString(),
                            endAt: values.endAt.toISOString(),
                        }).unwrap()
                        message.success('已保存选课周期')
                        setWindowSemesterId(null)
                    } catch (e: unknown) {
                        if ((e as { errorFields?: unknown }).errorFields) return
                        const err = e as { data?: { error?: { message?: string } } }
                        message.error(err.data?.error?.message ?? (e as Error).message ?? '保存失败')
                    }
                }}
            >
                {isWindowLoading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                    <>
                        <div className="text-slate-500 text-sm mb-3">
                            当前：{getDisplayTime()}
                        </div>
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                startAt: dayjs().startOf('day'),
                                endAt: dayjs().add(7, 'day').endOf('day'),
                            }}
                            onValuesChange={(_changedValues: Partial<{ startAt: Dayjs; endAt: Dayjs }>, allValues: { startAt: Dayjs; endAt: Dayjs }) => {
                                if (allValues.startAt && allValues.endAt) {
                                    setFormValues(allValues)
                                }
                            }}
                        >
                            <Form.Item
                                label="开始时间"
                                name="startAt"
                                rules={[{ required: true, message: '请选择开始时间' }]}
                                validateStatus={form.getFieldError('startAt') ? 'error' : ''}
                                help={form.getFieldError('startAt')?.[0]}
                            >
                                <DatePicker
                                    showTime
                                    className="w-full"
                                    value={form.getFieldValue('startAt')}
                                    onChange={(date) => form.setFieldValue('startAt', date)}
                                    format="YYYY-MM-DD HH:mm:ss"
                                />
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
                                validateStatus={form.getFieldError('endAt') ? 'error' : ''}
                                help={form.getFieldError('endAt')?.[0]}
                            >
                                <DatePicker
                                    showTime
                                    className="w-full"
                                    value={form.getFieldValue('endAt')}
                                    onChange={(date) => form.setFieldValue('endAt', date)}
                                    format="YYYY-MM-DD HH:mm:ss"
                                />
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Modal>
        </div>
    )
}