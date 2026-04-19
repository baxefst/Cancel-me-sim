'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [groqKey, setGroqKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')

  useEffect(() => {
    setGroqKey(localStorage.getItem('groq_api_key') ?? '')
    setGoogleKey(localStorage.getItem('google_api_key') ?? '')
  }, [isOpen])

  function save() {
    localStorage.setItem('groq_api_key', groqKey)
    localStorage.setItem('google_api_key', googleKey)
    onClose()
  }

  if (!isOpen) return null

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#111111',
    border: '1px solid #333333',
    color: '#00FF41',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 13,
    outline: 'none',
    marginTop: 6,
    marginBottom: 16,
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9998,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480,
          padding: 32,
          background: 'rgba(10,10,10,0.98)',
          border: '1px solid #333333',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <span style={{ color: '#00FF41', fontSize: 13, fontWeight: 700 }}>{'// SETTINGS'}</span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <label style={{ color: '#888', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
          Groq API Key (Primary)
        </label>
        <input
          type="password"
          value={groqKey}
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder="gsk_..."
          style={inputStyle}
        />

        <label style={{ color: '#888', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
          Google API Key (Fallback)
        </label>
        <input
          type="password"
          value={googleKey}
          onChange={(e) => setGoogleKey(e.target.value)}
          placeholder="AIza..."
          style={inputStyle}
        />

        <button
          onClick={save}
          style={{
            width: '100%',
            padding: '13px',
            background: 'transparent',
            border: '1px solid #FF007A',
            color: '#FF007A',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
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
          Save Keys
        </button>

        <p style={{ color: '#333', fontSize: 10, marginTop: 12, textAlign: 'center' }}>
          Keys stored in localStorage only. Never transmitted.
        </p>
      </div>
    </>
  )
}
