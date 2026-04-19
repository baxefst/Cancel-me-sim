'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (statement: string) => void
}

export default function TerminalInput({ onSubmit }: Props) {
  const [text, setText] = useState('')
  const [fading, setFading] = useState(false)

  function handleSubmit() {
    if (!text.trim()) return
    setFading(true)
    setTimeout(() => onSubmit(text.trim()), 600)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  const overLimit = text.length > 250

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        opacity: fading ? 0 : 1,
        transition: 'opacity 600ms ease',
        padding: '0 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ color: '#00FF41', fontSize: 12, marginBottom: 32, letterSpacing: 1 }}>
          {'>'} CANCEL ME SIMULATOR v1.0
          <span className="blinking-cursor" />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          maxLength={280}
          rows={6}
          placeholder="> Type your statement. The internet is watching."
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #333333',
            color: '#E2E8F0',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 14,
            padding: '16px',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.6,
            caretColor: '#FF007A',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#FF007A'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#333333'
          }}
        />

        <div
          style={{
            textAlign: 'right',
            color: overLimit ? '#FF4500' : '#555555',
            fontSize: 11,
            marginTop: 6,
            marginBottom: 12,
          }}
        >
          {text.length}/280
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid #FF007A',
            color: '#FF007A',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 12,
            letterSpacing: 3,
            textTransform: 'uppercase',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            opacity: text.trim() ? 1 : 0.4,
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            if (!text.trim()) return
            e.currentTarget.style.background = '#FF007A'
            e.currentTarget.style.color = '#0a0a0a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#FF007A'
          }}
        >
          Analyze
        </button>

        <p style={{ color: '#333333', fontSize: 10, textAlign: 'center', marginTop: 12 }}>
          {'>'} Your statement will be analyzed for outrage potential. Press Cmd/Ctrl+Enter to submit.
        </p>
      </div>
    </div>
  )
}
