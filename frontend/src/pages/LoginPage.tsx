import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Form, Input, message } from 'antd'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form' // 新增 Controller
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useLoginMutation } from '../features/auth/authApi'
import { useAppDispatch } from '../app/hooks'
import { setAuth } from '../features/auth/authSlice'

const schema = z.object({
    email: z.string().email('请输入正确的邮箱'),
    password: z.string().min(6, '密码至少 6 位'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [login, { isLoading }] = useLoginMutation()

    // 1. 从 useForm 中取出 control（用于绑定 Controller）
    const { control, handleSubmit, formState } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched', // 失去焦点时校验，避免输入时频繁提示
        defaultValues: { email: '', password: '' }, // 确保初始值为空字符串
    })

    const onSubmit = async (values: FormValues) => {
        try {
            const res = await login(values).unwrap()
            if (!res.success) throw new Error('登录失败')
            dispatch(setAuth(res.data))
            message.success('登录成功')

            const role = res.data.user.role
            navigate(role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/student', {
                replace: true,
            })
        } catch (e: unknown) {
            let errorMessage = '登录失败'
            if (e instanceof Error) errorMessage = e.message
            else if (typeof e === 'object' && e !== null && 'data' in e) {
                const err = e as { data?: { error?: { message?: string } } }
                errorMessage = err.data?.error?.message ?? errorMessage
            }
            message.error(errorMessage)
        }
    }

    return (
        <div className="min-h-full flex items-center justify-center px-4 py-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card w-[380px] max-w-full rounded-2xl" bordered={false}>
                    <div className="text-xl font-semibold text-slate-900">欢迎回来</div>
                    <div className="text-slate-500 mt-1">登录后开始选课与管理</div>

                    <Form layout="vertical" className="mt-6" onFinish={handleSubmit(onSubmit)}>
                        {/* 2. 邮箱输入框：用 Controller 包装，解决状态同步问题 */}
                        <Form.Item
                            label="邮箱"
                            validateStatus={formState.errors.email ? 'error' : undefined}
                            help={formState.errors.email?.message}
                        >
                            <Controller
                                control={control}
                                name="email"
                                render={({ field }) => (
                                    <Input placeholder="you@example.com" {...field} />
                                )}
                            />
                        </Form.Item>

                        {/* 3. 密码输入框：同样用 Controller 包装 */}
                        <Form.Item
                            label="密码"
                            validateStatus={formState.errors.password ? 'error' : undefined}
                            help={formState.errors.password?.message}
                        >
                            <Controller
                                control={control}
                                name="password"
                                render={({ field }) => (
                                    <Input.Password placeholder="请输入密码" {...field} />
                                )}
                            />
                        </Form.Item>

                        {/* 4. 登录按钮：保留 disabled 限制，输入合法后自动亮起 */}
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            disabled={!formState.isValid}
                        >
                            登录
                        </Button>

                        <div className="text-sm text-slate-500 mt-3">
                            还没有账号？<Link to="/register">学生注册</Link>
                        </div>
                    </Form>
                </Card>
            </motion.div>
        </div>
    )
}