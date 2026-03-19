'use client'

interface SkillScores {
  grammar: number
  vocabulary: number
  listening: number
  pronunciation: number
  fluency: number
}

export interface SkillsRadarChartProps {
  current: SkillScores
  previous?: SkillScores
}

const AXES = [
  { key: 'grammar', label: '文法', angle: -90 },
  { key: 'vocabulary', label: '語彙', angle: -18 },
  { key: 'listening', label: 'リスニング', angle: 54 },
  { key: 'pronunciation', label: '発音', angle: 126 },
  { key: 'fluency', label: '流暢さ', angle: 198 },
] as const

const CX = 150
const CY = 150
const MAX_RADIUS = 110
const LABEL_OFFSET = 24

function polarToCartesian(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

function buildPolygonPoints(scores: SkillScores): string {
  return AXES.map(({ key, angle }) => {
    const value = scores[key as keyof SkillScores] / 100
    const { x, y } = polarToCartesian(angle, value * MAX_RADIUS, CX, CY)
    return `${x},${y}`
  }).join(' ')
}

function PentagonRing({ fraction }: { fraction: number }) {
  const radius = MAX_RADIUS * fraction
  const points = AXES.map(({ angle }) => {
    const { x, y } = polarToCartesian(angle, radius, CX, CY)
    return `${x},${y}`
  }).join(' ')

  return (
    <polygon
      points={points}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      className="text-muted-foreground/30"
    />
  )
}

export function SkillsRadarChart({ current, previous }: SkillsRadarChartProps) {
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[300px]">
      {/* Background rings */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((f) => (
        <PentagonRing key={f} fraction={f} />
      ))}

      {/* Axis lines */}
      {AXES.map(({ key, angle }) => {
        const { x, y } = polarToCartesian(angle, MAX_RADIUS, CX, CY)
        return (
          <line
            key={key}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/30"
          />
        )
      })}

      {/* Previous data polygon */}
      {previous && (
        <polygon
          points={buildPolygonPoints(previous)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="text-muted-foreground/50"
        />
      )}

      {/* Current data polygon */}
      <polygon
        points={buildPolygonPoints(current)}
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />

      {/* Data points on current polygon */}
      {AXES.map(({ key, angle }) => {
        const value = current[key as keyof SkillScores] / 100
        const { x, y } = polarToCartesian(angle, value * MAX_RADIUS, CX, CY)
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r="3.5"
            fill="currentColor"
            className="text-primary"
          />
        )
      })}

      {/* Labels */}
      {AXES.map(({ key, label, angle }) => {
        const { x, y } = polarToCartesian(angle, MAX_RADIUS + LABEL_OFFSET, CX, CY)
        const value = current[key as keyof SkillScores]
        return (
          <g key={key}>
            <text
              x={x}
              y={y - 6}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-[11px] font-medium"
            >
              {label}
            </text>
            <text
              x={x}
              y={y + 8}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-[10px]"
            >
              {value}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
