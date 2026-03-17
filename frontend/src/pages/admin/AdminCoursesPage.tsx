import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Form, Input, InputNumber, Modal, Select, Skeleton, Space, Table, Tag, message } from 'antd'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import {
    useAdminCoursesQuery,
    useAdminUsersQuery,
    useCreateCourseMutation,
    useDeleteCourseMutation,
} from '../../features/admin/adminApi'

// 核心修复1：补充所有校验规则（节次上限+顺序+教师ID正整数）
const schema = z.object({
    name: z.string().min(1, '课程名不能为空'),
    teacherId: z.number().int('教师ID必须为整数').positive('请选择有效的授课教师'), // 新增：教师ID必须>0
    credits: z.number().min(0, '学分不能为负数'),
    capacity: z.number().min(1, '容量至少为1'),
    dayOfWeek: z.number().min(1, '周几必须≥1').max(7, '周几必须≤7'),
    startPeriod: z.number().min(1, '开始节次至少为1').max(17, '开始节次最多为17'), // 新增：上限17
    endPeriod: z.number().min(1, '结束节次至少为1').max(17, '结束节次最多为17'),   // 新增：上限17
    location: z.string().min(1, '地点不能为空'),
    schedule: z.string().min(1, '展示时间不能为空'),
    description: z.string().optional(),
})
    // 核心修复2：添加节次顺序校验（startPeriod ≤ endPeriod）
    .refine(data => data.startPeriod <= data.endPeriod, {
        message: '开始节次不能大于结束节次',
        path: ['endPeriod'], // 错误提示显示在结束节次字段
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

    const { control, handleSubmit, formState, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            teacherId: 0,
            credits: 2,
            capacity: 60,
            dayOfWeek: 1,
            startPeriod: 3,
            endPeriod: 4,
            location: '',
            schedule: '',
            description: '',
        },
    })

    // 解构错误信息，简化使用
    const { errors } = formState

    const onSubmit = async (values: FormValues) => {
        try {
            await createCourse(values).unwrap()
            message.success('创建成功')
            setOpen(false)
            reset()
        } catch (e: unknown) {
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
                                                    } catch (e: unknown) {
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
                // 核心修复3：恢复并启用按钮禁用逻辑，校验不通过时无法点击
                okButtonProps={{
                    disabled: !formState.isValid,
                    loading: isCreating
                }}
            >
                <Form layout="vertical">
                    {/* 课程名 */}
                    <Form.Item
                        label="课程名"
                        help={errors.name?.message}
                        validateStatus={errors.name ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <Input placeholder="请输入课程名" {...field} />
                            )}
                        />
                    </Form.Item>

                    {/* 授课教师 */}
                    <Form.Item
                        label="授课教师"
                        help={errors.teacherId?.message}
                        validateStatus={errors.teacherId ? 'error' : ''}
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
                                    {...field}
                                    // 核心修复4：处理初始值0，避免Select显示异常
                                    value={field.value === 0 ? undefined : field.value}
                                />
                            )}
                        />
                    </Form.Item>

                    <Space className="w-full" wrap>
                        {/* 学分 */}
                        <Form.Item
                            label="学分"
                            help={errors.credits?.message}
                            validateStatus={errors.credits ? 'error' : ''}
                        >
                            <Controller
                                control={control}
                                name="credits"
                                render={({ field }) => (
                                    // 核心修复5：改用InputNumber适配数字输入
                                    <InputNumber
                                        placeholder="请输入学分"
                                        min={0}
                                        {...field}
                                        value={field.value || undefined}
                                    />
                                )}
                            />
                        </Form.Item>
                        {/* 容量 */}
                        <Form.Item
                            label="容量"
                            help={errors.capacity?.message}
                            validateStatus={errors.capacity ? 'error' : ''}
                        >
                            <Controller
                                control={control}
                                name="capacity"
                                render={({ field }) => (
                                    <InputNumber
                                        placeholder="请输入容量"
                                        min={1}
                                        {...field}
                                        value={field.value || undefined}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Space>

                    <Space className="w-full" wrap>
                        {/* 周几 */}
                        <Form.Item
                            label="周几(1-7)"
                            help={errors.dayOfWeek?.message}
                            validateStatus={errors.dayOfWeek ? 'error' : ''}
                        >
                            <Controller
                                control={control}
                                name="dayOfWeek"
                                render={({ field }) => (
                                    <InputNumber
                                        placeholder="1-7"
                                        min={1}
                                        max={7}
                                        {...field}
                                        value={field.value || undefined}
                                    />
                                )}
                            />
                        </Form.Item>
                        {/* 开始节次 */}
                        <Form.Item
                            label="开始节次"
                            help={errors.startPeriod?.message}
                            validateStatus={errors.startPeriod ? 'error' : ''}
                        >
                            <Controller
                                control={control}
                                name="startPeriod"
                                render={({ field }) => (
                                    <InputNumber
                                        placeholder="1-17"
                                        min={1}
                                        max={17}
                                        {...field}
                                        value={field.value || undefined}
                                    />
                                )}
                            />
                        </Form.Item>
                        {/* 结束节次 */}
                        <Form.Item
                            label="结束节次"
                            help={errors.endPeriod?.message} // 节次顺序错误提示显示在这里
                            validateStatus={errors.endPeriod ? 'error' : ''}
                        >
                            <Controller
                                control={control}
                                name="endPeriod"
                                render={({ field }) => (
                                    <InputNumber
                                        placeholder="1-17"
                                        min={1}
                                        max={17}
                                        {...field}
                                        value={field.value || undefined}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Space>

                    {/* 地点 */}
                    <Form.Item
                        label="地点"
                        help={errors.location?.message}
                        validateStatus={errors.location ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="location"
                            render={({ field }) => (
                                <Input placeholder="请输入上课地点" {...field} />
                            )}
                        />
                    </Form.Item>
                    {/* 展示时间 */}
                    <Form.Item
                        label="展示时间字符串（如：周一3-4节）"
                        help={errors.schedule?.message}
                        validateStatus={errors.schedule ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="schedule"
                            render={({ field }) => (
                                <Input placeholder="如：周一3-4节" {...field} />
                            )}
                        />
                    </Form.Item>
                    {/* 描述 */}
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