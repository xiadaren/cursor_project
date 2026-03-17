import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Form, Input, Modal, Select, Skeleton, Space, Table, Tag, message } from 'antd'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form' // 新增 Controller
import { z } from 'zod'
import { useAdminUsersQuery, useCreateUserMutation, useResetPasswordMutation } from '../../features/admin/adminApi'

const schema = z.object({
    role: z.enum(['TEACHER', 'ADMIN']),
    email: z.string().email('请输入正确的邮箱'), // 补充错误提示
    name: z.string().min(1, '姓名不能为空'), // 补充错误提示
    teacherId: z.string().optional(),
    password: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AdminUsersPage() {
    const [role, setRole] = useState<'TEACHER' | 'ADMIN'>('TEACHER')
    const { data, isLoading } = useAdminUsersQuery({ role })
    const rows = data?.data ?? []

    const [open, setOpen] = useState(false)
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
    const [resetPwd, { isLoading: isResetting }] = useResetPasswordMutation()

    // 核心修复1：补全所有字段defaultValues，解决undefined问题
    const { control, handleSubmit, formState, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched', // 改为onTouched，避免输入时频繁提示
        defaultValues: {
            role: 'TEACHER',
            email: '', // ✅ 补充：邮箱初始为空字符串
            name: '', // ✅ 补充：姓名初始为空字符串
            teacherId: '', // ✅ 补充：工号初始为空字符串
            password: '', // ✅ 补充：密码初始为空字符串
        },
    })

    // 核心修复2：规范catch类型，any改为unknown
    const onSubmit = async (values: FormValues) => {
        try {
            await createUser(values).unwrap()
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
                    <Space wrap>
                        <div className="text-slate-900 font-semibold">用户管理</div>
                        <Select
                            value={role}
                            onChange={(v) => setRole(v)}
                            options={[
                                { value: 'TEACHER', label: '教师' },
                                { value: 'ADMIN', label: '管理员' },
                            ]}
                        />
                    </Space>
                    <Button type="primary" onClick={() => setOpen(true)}>
                        新建用户
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
                            { title: '姓名', dataIndex: 'name' },
                            { title: '邮箱', dataIndex: 'email' },
                            {
                                title: '角色',
                                dataIndex: 'role',
                                render: (v) => <Tag color={v === 'ADMIN' ? 'purple' : 'blue'}>{v}</Tag>,
                            },
                            { title: '工号', dataIndex: 'teacherId' },
                            {
                                title: '操作',
                                render: (_, r) => (
                                    <Button
                                        loading={isResetting}
                                        onClick={async () => {
                                            try {
                                                await resetPwd({ id: r.id }).unwrap()
                                                message.success('已重置密码（默认学号/工号）')
                                            } catch (e: unknown) { // any改为unknown
                                                let errorMessage = '重置失败'
                                                if (e instanceof Error) errorMessage = e.message
                                                else if (typeof e === 'object' && e !== null && 'data' in e) {
                                                    const err = e as { data?: { error?: { message?: string } } }
                                                    errorMessage = err.data?.error?.message ?? errorMessage
                                                }
                                                message.error(errorMessage)
                                            }
                                        }}
                                    >
                                        重置密码
                                    </Button>
                                ),
                            },
                        ]}
                    />
                )}
            </Card>

            <Modal
                title="新建用户"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleSubmit(onSubmit)}
                // 核心修复3：去掉disabled限制，按钮始终可点击，提交时校验并提示错误
                okButtonProps={{ loading: isCreating }}
            >
                <Form layout="vertical">
                    {/* 核心修复4：用Controller包装Select，自动绑定role */}
                    <Form.Item
                        label="角色"
                        help={formState.errors.role?.message}
                        validateStatus={formState.errors.role ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <Select
                                    defaultValue="TEACHER"
                                    options={[
                                        { value: 'TEACHER', label: '教师' },
                                        { value: 'ADMIN', label: '管理员' },
                                    ]}
                                    {...field} // 自动绑定value和onChange，无需手动setValue
                                />
                            )}
                        />
                    </Form.Item>

                    {/* 核心修复5：用Controller包装Input，解决状态同步 */}
                    <Form.Item
                        label="姓名"
                        help={formState.errors.name?.message}
                        validateStatus={formState.errors.name ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <Input placeholder="请输入姓名" {...field} />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        help={formState.errors.email?.message}
                        validateStatus={formState.errors.email ? 'error' : ''}
                    >
                        <Controller
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <Input placeholder="请输入邮箱" {...field} />
                            )}
                        />
                    </Form.Item>

                    <Form.Item label="工号(教师可选)">
                        <Controller
                            control={control}
                            name="teacherId"
                            render={({ field }) => (
                                <Input placeholder="选填：教师工号" {...field} />
                            )}
                        />
                    </Form.Item>

                    <Form.Item label="初始密码(可选，默认工号)">
                        <Controller
                            control={control}
                            name="password"
                            render={({ field }) => (
                                <Input.Password placeholder="选填：初始密码" {...field} />
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}