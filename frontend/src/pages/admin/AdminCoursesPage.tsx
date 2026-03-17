import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Form, Input, Modal, Select, Skeleton, Space, Table, Tag, message } from 'antd'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form' // 新增 Controller
import { z } from 'zod'
import {
    useAdminCoursesQuery,
    useAdminUsersQuery,
    useCreateCourseMutation,
    useDeleteCourseMutation,
} from '../../features/admin/adminApi'

const schema = z.object({
    name: z.string().min(1, '课程名不能为空'), // 补充错误提示
    teacherId: z.number().int('教师ID必须为整数'), // 补充类型校验
    credits: z.number().min(0, '学分不能为负数'),
    capacity: z.number().min(1, '容量至少为1'),
    dayOfWeek: z.number().min(1, '周几必须≥1').max(7, '周几必须≤7'),
    startPeriod: z.number().min(1, '开始节次至少为1'),
    endPeriod: z.number().min(1, '结束节次至少为1'),
    location: z.string().min(1, '地点不能为空'),
    schedule: z.string().min(1, '展示时间不能为空'),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AdminCoursesPage() {
    const { data, isLoading } = useAdminCoursesQuery()
    const rows = data?.data ?? []

    const { data: teachersData } = useAdminUsersQuery({ role: 'TEACHER' })
    const teachers = teachersData?.data ?? []

    const [open, setOpen] = useState(false)
    const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()
    const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()

    // 核心修复1：补全所有字段的defaultValues，字符串初始为空字符串，数字设默认值
    const { control, handleSubmit, formState, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched', // 改为onTouched，仅失去焦点时校验，避免输入时频繁提示
        defaultValues: {
            name: '', //  补充：课程名初始为空字符串（原缺失，导致undefined）
            teacherId: 0, // 补充：教师ID初始为0（原缺失）
            credits: 2,
            capacity: 60,
            dayOfWeek: 1,
            startPeriod: 3,
            endPeriod: 4,
            location: '', //  补充：地点初始为空字符串（原缺失）
            schedule: '', //  补充：展示时间初始为空字符串（原缺失）
            description: '', //  补充：描述初始为空字符串（原缺失）
        },
    })

    const onSubmit = async (values: FormValues) => {
        try {
            await createCourse(values).unwrap()
            message.success('创建成功')
            setOpen(false)
            reset()
        } catch (e: unknown) { // 核心修复2：any改为unknown，符合TS规范
            let errorMessage = '创建失败'
            if (e instanceof Error) errorMessage = e.message
            else if (typeof e === 'object' && e !== null && 'data' in e) {
                const err = e as { data?: { error?: { message?: string } } }
                errorMessage = err.data?.error?.message ?? errorMessage
            }
            message.error(errorMessage)
        }
    }

    return (
        <div className="grid gap-4">
            <Card className="glass-card rounded-2xl" bordered={false}>
                <Space className="w-full justify-between" wrap>
                    <div className="text-slate-900 font-semibold">课程管理</div>
                    <Button type="primary" onClick={() => setOpen(true)}>
                        新建课程
                    </Button>
                </Space>
            </Card>

            <Card className="glass-card rounded-2xl" bordered={false}>
                {isLoading ? (
                    <Skeleton active paragraph={{ rows: 8 }} />
                ) : (
                    <Table
                        rowKey="id"
                        dataSource={rows}
                        pagination={false}
                        columns={[
                            { title: '课程名', dataIndex: 'name' },
                            { title: '教师', dataIndex: 'teacherName' },
                            { title: '学分', dataIndex: 'credits', render: (v) => <Tag color="blue">{v}</Tag> },
                            { title: '容量', render: (_, r) => `${r.enrolled}/${r.capacity}` },
                            { title: '时间', dataIndex: 'schedule' },
                            { title: '地点', dataIndex: 'location' },
                            {
                                title: '操作',
                                render: (_, r) => (
                                    <Button
                                        danger
                                        loading={isDeleting}
                                        onClick={() =>
                                            Modal.confirm({
                                                title: '确认删除课程？',
                                                content: r.name,
                                                okText: '删除',
                                                okButtonProps: { danger: true },
                                                cancelText: '取消',
                                                onOk: async () => {
                                                    try {
                                                        await deleteCourse({ id: r.id }).unwrap()
                                                        message.success('删除成功')
                                                    } catch (e: unknown) { // any改为unknown
                                                        let errorMessage = '删除失败'
                                                        if (e instanceof Error) errorMessage = e.message
                                                        else if (typeof e === 'object' && e !== null && 'data' in e) {
                                                            const err = e as { data?: { error?: { message?: string } } }
                                                            errorMessage = err.data?.error?.message ?? errorMessage
                                                        }
                                                        message.error(errorMessage)
                                                    }
                                                },
                                            })
                                        }
                                    >
                                        删除
                                    </Button>
                                ),
                            },
                        ]}
                    />
                )}
            </Card>

            <Modal
                title="新建课程"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleSubmit(onSubmit)}
                // okButtonProps={{ disabled: !formState.isValid, loading: isCreating }}
                okButtonProps={{ loading: isCreating }}
            >
                <Form layout="vertical">
                    {/* 核心修复3：用Controller包装Input，解决状态同步 */}
                    <Form.Item
                        label="课程名"
                        help={formState.errors.name?.message}
                        validateStatus={formState.errors.name ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <Input placeholder="请输入课程名" {...field} />
                            )}
                        />
                    </Form.Item>

                    {/* 核心修复4：用Controller包装Select，绑定teacherId */}
                    <Form.Item
                        label="授课教师"
                        help={formState.errors.teacherId?.message}
                        validateStatus={formState.errors.teacherId ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="teacherId"
                            render={({ field }) => (
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="请选择授课教师"
                                    options={teachers.map((t) => ({ value: t.id, label: `${t.name}（${t.email}）` }))}
                                    {...field} // 自动绑定value和onChange，无需手动setValue
                                />
                            )}
                        />
                    </Form.Item>

                    <Space className="w-full" wrap>
                        <Form.Item label="学分">
                            <Controller
                                control={control}
                                name="credits"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="请输入学分"
                                        {...field}
                                        value={field.value || ''} // 避免数字初始值显示0的视觉问题
                                    />
                                )}
                            />
                        </Form.Item>
                        <Form.Item label="容量">
                            <Controller
                                control={control}
                                name="capacity"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="请输入容量"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Space>

                    <Space className="w-full" wrap>
                        <Form.Item label="周几(1-7)">
                            <Controller
                                control={control}
                                name="dayOfWeek"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="1-7"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />
                        </Form.Item>
                        <Form.Item label="开始节次">
                            <Controller
                                control={control}
                                name="startPeriod"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="请输入开始节次"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />
                        </Form.Item>
                        <Form.Item label="结束节次">
                            <Controller
                                control={control}
                                name="endPeriod"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="请输入结束节次"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item label="地点">
                        <Controller
                            control={control}
                            name="location"
                            render={({ field }) => (
                                <Input placeholder="请输入上课地点" {...field} />
                            )}
                        />
                    </Form.Item>
                    <Form.Item label="展示时间字符串（如：周一3-4节）">
                        <Controller
                            control={control}
                            name="schedule"
                            render={({ field }) => (
                                <Input placeholder="如：周一3-4节" {...field} />
                            )}
                        />
                    </Form.Item>
                    <Form.Item label="描述">
                        <Controller
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <Input.TextArea rows={3} placeholder="选填：课程描述" {...field} />
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}