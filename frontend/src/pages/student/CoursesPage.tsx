import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Drawer,
  Input,
  Modal,
  Select,
  Skeleton,
  Space,
  Tag,
  message,
} from 'antd'
import { motion } from 'framer-motion'
import { useCoursesQuery, useCourseDetailQuery, useDropMutation, useEnrollMutation } from '../../features/student/studentApi'
import type { CourseCardDto } from '../../features/student/studentApi'
import { useDebouncedValue } from '../../utils/useDebouncedValue'

function capacityTag(c: CourseCardDto) {
  const full = c.enrolled >= c.capacity
  return (
    <Tag color={full ? 'default' : 'blue'}>
      {c.enrolled}/{c.capacity}
    </Tag>
  )
}

export function CoursesPage() {
  const [keyword, setKeyword] = useState('')
  const [credits, setCredits] = useState<number | undefined>(undefined)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  const debouncedKeyword = useDebouncedValue(keyword, 250)
  const queryArg = useMemo(
    () => ({ keyword: debouncedKeyword.trim() || undefined, credits }),
    [debouncedKeyword, credits],
  )
  const { data, isLoading } = useCoursesQuery(queryArg)
  const courses = data?.data ?? []

  const { data: detailData, isFetching: isDetailLoading } = useCourseDetailQuery(
    selectedCourseId ? { id: selectedCourseId } : (undefined as any),
    { skip: !selectedCourseId },
  )

  const [enroll, { isLoading: isEnrolling }] = useEnrollMutation()
  const [drop, { isLoading: isDropping }] = useDropMutation()

  const onEnroll = (c: CourseCardDto) => {
    Modal.confirm({
      title: '确认选课？',
      content: (
        <div>
          <div className="font-medium">{c.name}</div>
          <div className="text-slate-500 text-sm mt-1">
            {c.teacherName} · {c.credits}学分 · {c.schedule} · {c.location}
          </div>
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await enroll({ courseId: c.id }).unwrap()
          message.success('选课成功')
        } catch (e: any) {
          message.error(e?.data?.error?.message ?? '选课失败')
        }
      },
    })
  }

  const onDrop = (c: CourseCardDto) => {
    Modal.confirm({
      title: '确认退课？',
      content: `${c.name}（退课后名额将释放）`,
      okText: '确认',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await drop({ courseId: c.id }).unwrap()
          message.success('退课成功')
        } catch (e: any) {
          message.error(e?.data?.error?.message ?? '退课失败')
        }
      },
    })
  }

  return (
    <div className="grid gap-4">
      <Card className="glass-card rounded-2xl" bordered={false}>
        <Space wrap className="w-full justify-between">
          <Space wrap>
            <Input.Search
              placeholder="按课程名搜索"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-[260px]"
            />
            <Select
              allowClear
              placeholder="学分筛选"
              value={credits}
              onChange={(v) => setCredits(v)}
              options={[1, 2, 3, 4].map((v) => ({ value: v, label: `${v}学分` }))}
              className="w-[140px]"
            />
          </Space>
          <div className="text-slate-500 text-sm">点击课程卡片查看详情</div>
        </Space>
      </Card>

      {isLoading ? (
        <Card className="glass-card rounded-2xl" bordered={false}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => {
            const full = c.enrolled >= c.capacity
            const actionDisabled = full && !c.selected
            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
              >
                <Badge.Ribbon text={c.selected ? '已选' : full ? '已满' : ''} color={c.selected ? 'green' : 'default'}>
                  <Card
                    className="glass-card rounded-2xl h-full cursor-pointer"
                    bordered={false}
                    onClick={() => setSelectedCourseId(c.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-slate-900 font-semibold">{c.name}</div>
                        <div className="text-slate-500 text-sm mt-1">{c.teacherName}</div>
                      </div>
                      {capacityTag(c)}
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      <div>学分：{c.credits}</div>
                      <div>时间：{c.schedule}</div>
                      <div>地点：{c.location}</div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {c.selected ? (
                        <Button
                          danger
                          onClick={(e) => {
                            e.stopPropagation()
                            onDrop(c)
                          }}
                          loading={isDropping}
                        >
                          退课
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          disabled={actionDisabled}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (full) message.warning('课程容量已满')
                            else onEnroll(c)
                          }}
                          loading={isEnrolling}
                        >
                          选课
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCourseId(c.id)
                        }}
                      >
                        详情
                      </Button>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </motion.div>
            )
          })}
        </div>
      )}

      <Drawer
        title="课程详情"
        open={!!selectedCourseId}
        onClose={() => setSelectedCourseId(null)}
        width={420}
      >
        {isDetailLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <>
            <div className="text-lg font-semibold text-slate-900">{detailData?.data?.name}</div>
            <div className="text-slate-500 mt-1">{detailData?.data?.teacherName}</div>
            <div className="mt-3 text-sm text-slate-600 space-y-1">
              <div>学分：{detailData?.data?.credits}</div>
              <div>
                容量：{detailData?.data?.enrolled}/{detailData?.data?.capacity}
              </div>
              <div>时间：{detailData?.data?.schedule}</div>
              <div>地点：{detailData?.data?.location}</div>
            </div>
            <div className="mt-4">
              <div className="text-slate-900 font-medium">课程描述</div>
              <div className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">
                {detailData?.data?.description ?? '暂无'}
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}

