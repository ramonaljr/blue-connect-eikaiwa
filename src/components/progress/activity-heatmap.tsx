'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HeatmapData {
  date: string
  value: number
}

interface ActivityHeatmapProps {
  data: HeatmapData[]
}

const COLORS = [
  'bg-muted',
  'bg-green-200 dark:bg-green-900',
  'bg-green-400 dark:bg-green-700',
  'bg-green-600 dark:bg-green-500',
  'bg-green-800 dark:bg-green-300',
]

function getColor(value: number): string {
  if (value === 0) return COLORS[0]
  if (value < 30) return COLORS[1]
  if (value < 80) return COLORS[2]
  if (value < 150) return COLORS[3]
  return COLORS[4]
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string
    value: number
    x: number
    y: number
  } | null>(null)

  const { grid, months } = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.date, d.value]))

    const today = new Date()
    const days: Array<{ date: string; value: number; dayOfWeek: number }> = []

    // Go back 90 days
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      // JS: 0=Sun, convert so 0=Mon
      const jsDay = d.getDay()
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1
      days.push({
        date: dateStr,
        value: dataMap.get(dateStr) ?? 0,
        dayOfWeek,
      })
    }

    // Build grid: 13 columns x 7 rows
    // Each column is a week. Find the start of the first full week.
    const gridCells: Array<{
      date: string
      value: number
      row: number
      col: number
    } | null>[] = Array.from({ length: 7 }, () => [])

    let col = 0
    let prevDayOfWeek = -1
    for (const day of days) {
      if (day.dayOfWeek <= prevDayOfWeek) {
        col++
      }
      prevDayOfWeek = day.dayOfWeek
      gridCells[day.dayOfWeek].push({
        date: day.date,
        value: day.value,
        row: day.dayOfWeek,
        col,
      })
    }

    // Pad columns to 13
    const totalCols = col + 1
    for (let row = 0; row < 7; row++) {
      while (gridCells[row].length < totalCols) {
        gridCells[row].unshift(null)
      }
    }

    // Extract month labels
    const monthLabels: Array<{ label: string; col: number }> = []
    let lastMonth = -1
    for (const day of days) {
      const d = new Date(day.date)
      const month = d.getMonth()
      if (month !== lastMonth) {
        const dayCol = gridCells[day.dayOfWeek]?.findIndex(
          (c) => c?.date === day.date
        )
        if (dayCol !== undefined && dayCol >= 0) {
          const monthNames = [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
          ]
          monthLabels.push({ label: monthNames[month], col: dayCol })
        }
        lastMonth = month
      }
    }

    return { grid: gridCells, months: monthLabels }
  }, [data])

  const totalCols = grid[0]?.length ?? 13

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">学習アクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Month labels */}
        <div className="mb-1 ml-8 overflow-x-auto">
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
            }}
          >
            {Array.from({ length: totalCols }, (_, i) => {
              const month = months.find((m) => m.col === i)
              return (
                <div
                  key={i}
                  className="text-[10px] text-muted-foreground"
                >
                  {month?.label ?? ''}
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative flex gap-1 overflow-x-auto">
          {/* Day labels */}
          <div className="flex shrink-0 flex-col gap-[3px]">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex h-3 w-6 items-center justify-end text-[10px] text-muted-foreground"
              >
                {i % 2 === 0 ? label : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid flex-1 gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
            }}
          >
            {Array.from({ length: 7 }, (_, row) =>
              grid[row]?.map((cell, col) => (
                <div
                  key={`${row}-${col}`}
                  className={`h-3 w-3 rounded-sm ${
                    cell ? getColor(cell.value) : 'bg-transparent'
                  } transition-colors`}
                  onMouseEnter={(e) => {
                    if (cell) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        date: cell.date,
                        value: cell.value,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))
            )}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
              style={{
                left: tooltip.x,
                top: tooltip.y - 4,
              }}
            >
              <div className="font-medium">{tooltip.date}</div>
              <div>{tooltip.value} XP</div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>少ない</span>
          {COLORS.map((color, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-sm ${color}`}
            />
          ))}
          <span>多い</span>
        </div>
      </CardContent>
    </Card>
  )
}
