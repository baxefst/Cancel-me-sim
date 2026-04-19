'use client'

import { useCallback, useState } from 'react'
import { Settings } from 'lucide-react'
import LogOverlay from '@/components/LogOverlay'
import SettingsModal from '@/components/SettingsModal'
import SimulationController from '@/components/SimulationController'
import TerminalInput from '@/components/TerminalInput'
import { analyzeStatement } from '@/lib/ai'
import type { AnalysisResult, AppState, LogMessage } from '@/types'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)

  const addLog = useCallback((text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        timestamp: Date.now(),
      },
    ])
  }, [])

  const handleSubmit = useCallback(
    async (statement: string) => {
      setAppState('analyzing')
      setLogs([])
      addLog('> Initializing forensics engine...')

      try {
        const result = await analyzeStatement(statement, addLog)
        addLog(`> ${result.risk_label} THREAT PROFILE GENERATED`)
        addLog('> Loading simulation environment...')
        setAnalysis(result)
        setTimeout(() => setAppState('simulating'), 1200)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        addLog(`> ERROR: ${msg}`)
        addLog('> Open settings and verify your API keys.')
        setTimeout(() => setAppState('idle'), 3000)
      }
    },
    [addLog],
  )

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#0a0a0a',
        overflow: 'hidden',
        fontFamily: 'IBM Plex Mono, monospace',
      }}
    >
      {appState === 'idle' && <TerminalInput onSubmit={handleSubmit} />}

      {appState === 'analyzing' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <LogOverlay messages={logs} />
          <div
            style={{
              color: '#FF007A',
              fontSize: 12,
              marginTop: 24,
              animation: 'blink 1s infinite',
            }}
          >
            ████████████████
          </div>
        </div>
      )}

      {(appState === 'simulating' || appState === 'report') && analysis && (
        <SimulationController analysis={analysis} />
      )}

      <button
        onClick={() => setSettingsOpen(true)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9995,
          background: 'transparent',
          border: 'none',
          color: '#444444',
          cursor: 'pointer',
          padding: 8,
          transition: 'color 200ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#444444'
        }}
        aria-label="Settings"
      >
        <Settings size={18} />
      </button>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false)
        }}
      />
    </main>
  )
}
