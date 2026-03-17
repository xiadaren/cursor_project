import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Form, Input, message } from 'antd'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form' // 仅新增引入Controller
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useRegisterMutation } from '../features/auth/authApi'

// 保留原有密码校验规则
const passwordSchema = z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[A-Z]/, '至少包含 1 个大写字母')
    .regex(/[a-z]/, '至少包含 1 个小写字母')
    .regex(/[0-9]/, '至少包含 1 个数字')

// 保留原有表单校验规则
const schema = z.object({
    name: z.string().min(2, '请输入姓名'),
    studentId: z.string().min(4, '请输入学号'),
    email: z.string().email('请输入正确的邮箱'),
    password: passwordSchema,
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
    const navigate = useNavigate()
    const [registerStudent, { isLoading }] = useRegisterMutation() // 保留原有变量名

    // 核心修复1：补全defaultValues，保留原有mode: 'onChange'（也可改onTouched，看需求）
    const { control, handleSubmit, formState } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange', // 保留原有实时校验模式
        defaultValues: { // 新增：给所有字段设初始值，解决undefined问题
            name: '',
            studentId: '',
            email: '',
            password: '',
        },
    })

    // 核心修复2：catch的any改为unknown，保留原有错误提示逻辑
    const onSubmit = async (values: FormValues) => {
        try {
            await registerStudent(values).unwrap()
            message.success('注册成功，请登录')
            navigate('/login', { replace: true })
        } catch (e: unknown) { // 仅修改这里：any → unknown
            let errorMessage = '注册失败'
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
                {/* 保留原有卡片尺寸、样式 */}
                <Card className="glass-card w-[420px] max-w-full rounded-2xl" bordered={false}>
                    <div className="text-xl font-semibold text-slate-900">学生注册</div>
                    <div className="text-slate-500 mt-1">教师/管理员账号由系统创建</div>

                    <Form layout="vertical" className="mt-6" onFinish={handleSubmit(onSubmit)}>
                        {/* 姓名输入框：保留原有提示/占位符，仅用Controller包装 */}
                        <Form.Item
                            label="姓名"
                            validateStatus={formState.errors.name ? 'error' : undefined}
                            help={formState.errors.name?.message}
                        >
                            <Controller
                                control={control}
                                name="name"
                                render={({ field }) => (
                                    <Input placeholder="张三" {...field} /> // 保留原有占位符
                                )}
                            />
                        </Form.Item>

                        {/* 学号输入框：保留原有配置，仅用Controller包装 */}
                        <Form.Item
                            label="学号"
                            validateStatus={formState.errors.studentId ? 'error' : undefined}
                            help={formState.errors.studentId?.message}
                        >
                            <Controller
                                control={control}
                                name="studentId"
                                render={({ field }) => (
                                    <Input placeholder="20250001" {...field} /> // 保留原有占位符
                                )}
                            />
                        </Form.Item>

                        {/* 邮箱输入框：保留原有配置，仅用Controller包装 */}
                        <Form.Item
                            label="邮箱"
                            validateStatus={formState.errors.email ? 'error' : undefined}
                            help={formState.errors.email?.message}
                        >
                            <Controller
                                control={control}
                                name="email"
                                render={({ field }) => (
                                    <Input placeholder="student@example.com" {...field} /> // 保留原有占位符
                                )}
                            />
                        </Form.Item>

                        {/* 密码输入框：保留原有校验提示/占位符，仅用Controller包装 */}
                        <Form.Item
                            label="密码"
                            validateStatus={formState.errors.password ? 'error' : undefined}
                            help={formState.errors.password?.message}
                        >
                            <Controller
                                control={control}
                                name="password"
                                render={({ field }) => (
                                    <Input.Password placeholder="至少 8 位，大小写+数字" {...field} /> // 保留原有占位符
                                )}
                            />
                        </Form.Item>

                        {/* 注册按钮：保留原有disabled限制，补全defaultValues后输入合法内容会自动亮起 */}
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            disabled={!formState.isValid} // 保留原有配置
                        >
                            注册
                        </Button>

                        {/* 保留原有跳转文案 */}
                        <div className="text-sm text-slate-500 mt-3">
                            已有账号？<Link to="/login">返回登录</Link>
                        </div>
                    </Form>
                </Card>
            </motion.div>
        </div>
    )
}