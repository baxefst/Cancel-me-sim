'use client'

import { useEffect, useRef } from 'react'
import type { LogMessage } from '@/types'

interface Props {
  messages: LogMessage[]
}

export default function LogOverlay({ messages }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const visible = messages.slice(-12)

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        width: 420,
        maxHeight: 300,
        overflow: 'hidden',
        zIndex: 9990,
        pointerEvents: 'none',
      }}
    >
      {visible.map((msg, i) => (
        <div
          key={msg.id}
          className="log-line"
          style={{
            color: '#00FF41',
            fontSize: 12,
            lineHeight: '1.6',
            fontFamily: 'IBM Plex Mono, monospace',
            opacity: i < visible.length - 6 ? 0.35 : 1,
            animationDelay: `${i * 80}ms`,
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  )
}
