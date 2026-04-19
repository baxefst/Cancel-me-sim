'use client'

import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import type { AnalysisResult } from '@/types'

interface Props {
  analysis: AnalysisResult
  visible: boolean
}

const RISK_COLORS: Record<string, string> = {
  LOW: '#00FF41',
  MEDIUM: '#FBBF24',
  HIGH: '#FF4500',
  CRITICAL: '#FF007A',
  EXTINCTION: '#ffffff',
}

export default function ThreatReport({ analysis, visible }: Props) {
  const [displayText, setDisplayText] = useState('')
  const [barsReady, setBarsReady] = useState(false)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!visible) return
    setBarsReady(false)
    setDisplayText('')
    setTimeout(() => setBarsReady(true), 300)
    let i = 0
    const text = analysis.summary
    typewriterRef.current = setInterval(() => {
      setDisplayText(text.slice(0, i + 1))
      i += 1
      if (i >= text.length && typewriterRef.current) {
        clearInterval(typewriterRef.current)
      }
    }, 35)
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current)
    }
  }, [visible, analysis.summary])

  async function exportReport() {
    const canvas = await html2canvas(document.body, {
      backgroundColor: '#0a0a0a',
      scale: 1,
      useCORS: true,
    })
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.font = 'bold 72px IBM Plex Mono'
    ctx.fillStyle = 'rgba(255,0,0,0.55)'

    const cols = 3
    const rows = 3
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = canvas.width * ((col + 0.5) / cols)
        const y = canvas.height * ((row + 0.5) / rows)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-Math.PI / 4)
        ctx.fillText('CANCELLED', -150, 0)
        ctx.restore()
      }
    }

    const link = document.createElement('a')
    link.download = `cancel-me-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const outrage = analysis.risk_score
  const logic = Math.round((1 - analysis.sentiment_vector[4]) * 100)
  const absurdity = Math.round(Math.abs(analysis.sentiment_vector[1]) * 100)
  const riskColor = RISK_COLORS[analysis.risk_label] ?? '#fff'

  const bars = [
    { label: 'OUTRAGE INDEX', value: outrage, color: '#FF4500' },
    { label: 'LOGIC COHERENCE', value: logic, color: '#00FF41' },
    { label: 'ABSURDITY FACTOR', value: absurdity, color: '#A855F7' },
  ]

  return (
    <div
      className={`threat-report-panel ${visible ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '52vh',
        background: 'rgba(10,10,10,0.97)',
        borderTop: '2px solid #FF4500',
        zIndex: 9990,
        overflowY: 'auto',
        padding: '24px 32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <span style={{ color: '#FF4500', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
          {'// THREAT ANALYSIS COMPLETE'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              border: `1px solid ${riskColor}`,
              color: riskColor,
              padding: '3px 12px',
              fontSize: 11,
              letterSpacing: 2,
              background: analysis.risk_label === 'EXTINCTION' ? 'rgba(255,0,0,0.2)' : 'transparent',
              animation: analysis.risk_label === 'EXTINCTION' ? 'pulseRed 1s infinite' : 'none',
            }}
          >
            {analysis.risk_label}
          </span>

          <button
            onClick={exportReport}
            style={{
              background: 'transparent',
              border: '1px solid #FF007A',
              color: '#FF007A',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 10,
              letterSpacing: 1,
              padding: '4px 12px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FF007A'
              e.currentTarget.style.color = '#0a0a0a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#FF007A'
            }}
          >
            EXPORT REPORT
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {bars.map((bar, i) => (
          <div key={bar.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#888', fontSize: 10, letterSpacing: 1 }}>{bar.label}</span>
              <span style={{ color: bar.color, fontSize: 10 }}>{bar.value}%</span>
            </div>
            <div
              style={{
                background: '#111111',
                height: 4,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                className="progress-bar-fill"
                style={{
                  height: '100%',
                  background: bar.color,
                  width: barsReady ? `${bar.value}%` : '0%',
                  transition: `width 1200ms ease-out ${i * 200}ms`,
                  boxShadow: `0 0 8px ${bar.color}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>ASSESSMENT:</div>
        <div style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 1.6 }}>
          {displayText}
          <span className="blinking-cursor" />
        </div>
      </div>

      <div>
        <div style={{ color: '#333', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
          {'// LIVE FEED'}
        </div>
        {analysis.micro_replies.map((reply, i) => (
          <div
            key={`${reply}-${i}`}
            style={{
              padding: '6px 0',
              borderBottom: '1px solid #111',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: '#00FF41' }}>{'> '}</span>
            <span style={{ color: '#888888' }}>{reply}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
