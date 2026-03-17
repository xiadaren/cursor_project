import { Card, Skeleton } from 'antd'
import { useMemo } from 'react'
import { useScheduleQuery } from '../../features/student/studentApi'

const days = [
  { id: 1, label: '周一' },
  { id: 2, label: '周二' },
  { id: 3, label: '周三' },
  { id: 4, label: '周四' },
  { id: 5, label: '周五' },
  { id: 6, label: '周六' },
  { id: 7, label: '周日' },
]

const colors = [
  'bg-blue-500/15 border-blue-500/30',
  'bg-emerald-500/15 border-emerald-500/30',
  'bg-violet-500/15 border-violet-500/30',
  'bg-amber-500/15 border-amber-500/30',
  'bg-rose-500/15 border-rose-500/30',
]

export function SchedulePage() {
  const { data, isLoading } = useScheduleQuery()
  const list = data?.data ?? []

  const colorMap = useMemo(() => {
    const map = new Map<number, string>()
    list.forEach((c, idx) => map.set(c.courseId, colors[idx % colors.length]))
    return map
  }, [list])

  const periods = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <Card className="glass-card rounded-2xl" bordered={false}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="overflow-auto">
          <div className="min-w-[860px] grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
            <div className="text-slate-500 text-sm p-2">节次</div>
            {days.map((d) => (
              <div key={d.id} className="text-slate-700 font-medium p-2">
                {d.label}
              </div>
            ))}

            {periods.map((p) => (
              <div key={`row-${p}`} className="contents">
                <div className="text-slate-500 text-sm p-2 border-t border-slate-200/40">{p}</div>
                {days.map((d) => {
                  const course = list.find(
                    (c) => c.dayOfWeek === d.id && c.startPeriod <= p && c.endPeriod >= p,
                  )
                  const isStart = course && course.startPeriod === p
                  return (
                    <div key={`${d.id}-${p}`} className="p-2 border-t border-slate-200/40">
                      {isStart && course ? (
                        <div
                          className={[
                            'rounded-xl border px-3 py-2 text-sm',
                            colorMap.get(course.courseId) ?? 'bg-slate-500/10 border-slate-500/20',
                          ].join(' ')}
                          style={{ height: 48 + (course.endPeriod - course.startPeriod) * 44 }}
                        >
                          <div className="font-medium text-slate-900">{course.name}</div>
                          <div className="text-slate-600 text-xs mt-0.5">
                            {course.location} · {course.teacherName}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

