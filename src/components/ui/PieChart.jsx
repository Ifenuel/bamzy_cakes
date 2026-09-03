import { useState } from 'react'

const COLORS = ['#A97BD6', '#F04B8A', '#6F4AA8', '#FBD7E7', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444']

/**
 * Interactive SVG pie/donut chart.
 * Click a segment to select it and show details.
 * Props:
 *   segments: [{ label, value, color?, detail? }]
 *   size, thickness, formatValue, onSegmentClick
 */
export default function PieChart({
  segments = [],
  size = 180,
  thickness = 40,
  formatValue = (v) => String(v),
  onSegmentClick,
}) {
  const [selected, setSelected] = useState(null)
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const cx = size / 2
  const cy = size / 2

  function handleClick(seg, index) {
    const next = selected === index ? null : index
    setSelected(next)
    if (onSegmentClick) onSegmentClick(next === null ? null : seg)
  }

  // Build arcs
  let cumulative = 0
  const arcs = segments.map((seg, i) => {
    const pct = seg.value / total
    const startAngle = cumulative * 360
    cumulative += pct
    const endAngle = cumulative * 360
    const color = seg.color || COLORS[i % COLORS.length]
    return { ...seg, pct, startAngle, endAngle, color, index: i }
  })

  const selectedSeg = selected !== null ? arcs[selected] : null

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chart */}
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((arc) => {
            const isSelected = selected === arc.index
            const strokeW = isSelected ? thickness + 6 : thickness
            const radius = (size - strokeW) / 2
            const circ = 2 * Math.PI * radius
            const dash = `${arc.pct * circ} ${circ}`
            const offset = -(arc.startAngle / 360) * circ

            return (
              <circle
                key={arc.index}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeW}
                strokeDasharray={dash}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: selected !== null && !isSelected ? 0.4 : 1 }}
                onClick={() => handleClick(arc, arc.index)}
              />
            )
          })}
          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-ink text-[15px] font-bold">
            {selectedSeg ? formatValue(selectedSeg.value) : total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-ink-muted text-[9px]">
            {selectedSeg ? selectedSeg.label : 'total'}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="w-full space-y-1.5">
        {arcs.map((arc) => (
          <button
            key={arc.index}
            onClick={() => handleClick(arc, arc.index)}
            className={
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ' +
              (selected === arc.index
                ? 'bg-brand-gradient-soft ring-1 ring-pink/30'
                : 'hover:bg-lilac-soft/30')
            }
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: arc.color }} />
              <span className="capitalize text-ink">{arc.label}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-ink">{formatValue(arc.value)}</span>
              <span className="ml-1 text-xs text-ink-muted">({(arc.pct * 100).toFixed(1)}%)</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected detail */}
      {selectedSeg && (
        <div className="w-full rounded-xl border border-lilac-soft bg-brand-gradient-soft p-4 text-center">
          <p className="text-sm font-semibold text-ink">{selectedSeg.label}</p>
          <p className="mt-1 text-xl font-bold text-pink">{formatValue(selectedSeg.value)}</p>
          <p className="text-xs text-ink-muted">{(selectedSeg.pct * 100).toFixed(1)}% of total</p>
          {selectedSeg.detail && (
            <p className="mt-2 text-xs text-ink-muted">{selectedSeg.detail}</p>
          )}
        </div>
      )}
    </div>
  )
}
