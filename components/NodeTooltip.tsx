'use client'

import type { TooltipState } from '@/types'

interface Props {
  state: TooltipState
}

export default function NodeTooltip({ state }: Props) {
  const { visible, x, y, node } = state
  if (!node) return null

  const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth
  const viewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight
  const safeX = x + 296 > viewportWidth ? x - 296 : x + 16
  const safeY = y + 140 > viewportHeight ? Math.max(16, y - 120) : Math.max(16, y - 16)

  return (
    <div
      style={{
        position: 'fixed',
        left: safeX,
        top: safeY,
        minWidth: 200,
        maxWidth: 280,
        padding: '12px 14px',
        background: 'rgba(10,10,10,0.92)',
        border: `1px solid ${node.color}`,
        backdropFilter: 'blur(4px)',
        zIndex: 9992,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    >
      <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 700 }}>{node.handle}</div>
      <div
        style={{
          display: 'inline-block',
          marginTop: 6,
          marginBottom: 6,
          padding: '2px 8px',
          border: `1px solid ${node.color}`,
          color: node.color,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
          background: `${node.color}22`,
        }}
      >
        {node.persona}
      </div>
      <div
        style={{
          color: '#888888',
          fontSize: 12,
          fontStyle: 'italic',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {node.comment}
      </div>
    </div>
  )
}
