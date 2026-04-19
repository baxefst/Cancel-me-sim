'use client'

import { useState } from 'react'
import { PERSONA_CONFIG } from '@/lib/personas'
import type { PersonaNode, PersonaLink, PersonaType } from '@/types'

interface Props {
  node: PersonaNode | null
  allNodes: PersonaNode[]
  allLinks: PersonaLink[]
  onClose: () => void
  onSelectNode: (node: PersonaNode) => void
}

export default function NodeIntelligence({
  node,
  allNodes: _allNodes,
  allLinks,
  onClose,
  onSelectNode,
}: Props) {
  const [filterPersona, setFilterPersona] = useState<PersonaType | null>(null)

  if (!node) return null

  const connectedNodes = allLinks
    .filter((l) => {
      const srcId =
        typeof l.source === 'object'
          ? (l.source as PersonaNode).id
          : String(l.source)
      const tgtId =
        typeof l.target === 'object'
          ? (l.target as PersonaNode).id
          : String(l.target)
      return srcId === node.id || tgtId === node.id
    })
    .map((l) => {
      const src = l.source as PersonaNode | string
      const tgt = l.target as PersonaNode | string
      const srcId = typeof src === 'object' ? src.id : String(src)
      if (srcId === node.id) {
        return typeof tgt === 'object' ? tgt : null
      }
      return typeof src === 'object' ? src : null
    })
    .filter(
      (n): n is PersonaNode =>
        n !== null &&
        n !== undefined &&
        typeof n === 'object' &&
        'persona' in n,
    )

  const uniqueConnected = connectedNodes.filter(
    (n, i, arr) => arr.findIndex((x) => x.id === n.id) === i,
  )

  const personasInConnections = Array.from(
    new Set(uniqueConnected.map((n) => n.persona)),
  )

  const filteredConnections = filterPersona
    ? uniqueConnected.filter((n) => n.persona === filterPersona)
    : uniqueConnected

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9980,
          pointerEvents: 'auto',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 320,
          height: '100vh',
          background: 'rgba(10,10,10,0.96)',
          borderLeft: `3px solid ${node.color}`,
          borderTop: '1px solid #222',
          zIndex: 9985,
          overflowY: 'auto',
          padding: '24px 20px 40px 20px',
          fontFamily: 'IBM Plex Mono, monospace',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'slideInRight 250ms ease forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                color: '#555555',
                fontSize: 10,
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              // NODE INTELLIGENCE
            </div>
            <div
              style={{
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {node.handle}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#444',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#444'
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            border: `1px solid ${node.color}`,
            color: node.color,
            fontSize: 10,
            letterSpacing: 2,
            textTransform: 'uppercase',
            background: `${node.color}22`,
            width: 'fit-content',
          }}
        >
          {node.persona}
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a' }} />

        <div>
          <div
            style={{
              color: '#555555',
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            UUID
          </div>
          <div
            style={{
              color: '#666666',
              fontSize: 10,
              userSelect: 'text',
              wordBreak: 'break-all',
              lineHeight: 1.6,
              cursor: 'text',
            }}
          >
            {node.id}
          </div>
        </div>

        <div>
          <div
            style={{
              color: '#555555',
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            STATEMENT
          </div>
          <div
            style={{
              color: '#bbbbbb',
              fontSize: 12,
              fontStyle: 'italic',
              lineHeight: 1.7,
              borderLeft: `2px solid ${node.color}44`,
              paddingLeft: 10,
            }}
          >
            &quot;{node.comment}&quot;
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a' }} />

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                color: '#555555',
                fontSize: 10,
                letterSpacing: 1,
              }}
            >
              CONNECTIONS
            </span>
            <span
              style={{
                background: `${node.color}33`,
                border: `1px solid ${node.color}66`,
                color: node.color,
                fontSize: 9,
                padding: '1px 7px',
                borderRadius: 2,
              }}
            >
              {uniqueConnected.length}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setFilterPersona(null)}
              style={{
                background: filterPersona === null ? '#ffffff22' : 'transparent',
                border: '1px solid #333',
                color: filterPersona === null ? '#fff' : '#555',
                fontSize: 9,
                padding: '2px 8px',
                cursor: 'pointer',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              ALL
            </button>
            {personasInConnections.map((p) => {
              const pColor = PERSONA_CONFIG[p]?.color ?? '#888'
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() =>
                    setFilterPersona(filterPersona === p ? null : p)
                  }
                  style={{
                    background:
                      filterPersona === p ? `${pColor}33` : 'transparent',
                    border: `1px solid ${pColor}66`,
                    color: filterPersona === p ? pColor : '#555',
                    fontSize: 9,
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <div
            className="node-intelligence-scroll"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: 'calc(100vh - 520px)',
              minHeight: 120,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {filteredConnections.length === 0 && (
              <div style={{ color: '#333', fontSize: 11 }}>No direct connections</div>
            )}
            {filteredConnections.map((connected) => (
              <div
                key={connected.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectNode(connected)
                  }
                }}
                onClick={() => onSelectNode(connected)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderLeft: `2px solid ${connected.color}`,
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${connected.color}11`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
              >
                <span style={{ color: '#ccc', fontSize: 11 }}>
                  → {connected.handle}
                </span>
                <span
                  style={{
                    color: connected.color,
                    fontSize: 9,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {connected.persona}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a' }} />

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                color: '#555555',
                fontSize: 10,
                letterSpacing: 1,
              }}
            >
              METRICS
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: '#1a1a1a',
              }}
            />
          </div>
          {(
            [
              ['Mass', node.mass.toFixed(2)],
              ['Radius', `${node.radius}px`],
              ['Connections', String(uniqueConnected.length)],
              ['Allegiance', node.allegiance.toFixed(2)],
              ['Spawn Time', new Date(node.spawnTime).toLocaleTimeString()],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '1px solid #1a1a1a',
              }}
            >
              <span
                style={{
                  color: '#666666',
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                {String(label)}
              </span>
              <span
                style={{
                  color: '#cccccc',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
