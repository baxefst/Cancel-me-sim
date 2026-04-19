'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { generateLinks, generateNodes } from '@/lib/personas'
import type {
  AnalysisResult,
  LogMessage,
  PersonaLink,
  PersonaNode,
  SimRound,
  SimulationRefs,
  TooltipState,
} from '@/types'
import LogOverlay from './LogOverlay'
import NetworkCanvas from './NetworkCanvas'
import NodeIntelligence from './NodeIntelligence'
import NodeTooltip from './NodeTooltip'
import ThreatReport from './ThreatReport'

interface Props {
  analysis: AnalysisResult
}

export default function SimulationController({ analysis }: Props) {
  const [round, setRound] = useState<SimRound>(1)
  const [nodes, setNodes] = useState<PersonaNode[]>([])
  const [links, setLinks] = useState<PersonaLink[]>([])
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  })
  const [showReport, setShowReport] = useState(false)
  const [selectedNode, setSelectedNode] = useState<PersonaNode | null>(null)

  const canvasRef = useRef<SimulationRefs>(null)
  const nodesRef = useRef<PersonaNode[]>([])
  const dimRef = useRef({ w: 0, h: 0 })
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const handleNodeClick = useCallback((node: PersonaNode | null) => {
    setSelectedNode(node)
  }, [])

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

  useEffect(() => {
    const onResize = () => {
      dimRef.current = { w: window.innerWidth, h: window.innerHeight }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedNode(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    const { w, h } = dimRef.current
    const canvas = canvasRef.current

    if (round === 1) {
      addLog('> Monitoring initialized. 40 nodes online.')
      addLog('> Signal weak. Atmosphere... quiet.')
      const n = generateNodes(1, [], analysis, w, h)
      const l = generateLinks(n)
      nodesRef.current = n
      setNodes(n)
      setLinks(l)
      canvas?.addNodes(n)
      canvas?.addLinks(l)
      timeoutIdsRef.current.push(setTimeout(() => setRound(2), 3000))
    }

    if (round === 2) {
      addLog('> Fan cluster detected.')
      addLog('> Gravitational pull increasing...')
      const n = generateNodes(2, nodesRef.current, analysis, w, h)
      const allNodes = [...nodesRef.current, ...n]
      const l = generateLinks(allNodes)
      nodesRef.current = allNodes
      setNodes(allNodes)
      setLinks(l)
      canvas?.addNodes(n)
      canvas?.addLinks(l)
      timeoutIdsRef.current.push(setTimeout(() => setRound(3), 4000))
    }

    if (round === 3) {
      addLog('> ⚠ ANOMALY DETECTED.')
      addLog('> Bot cluster materializing...')

      const n = generateNodes(3, nodesRef.current, analysis, w, h)
      const allNodes = [...nodesRef.current, ...n]
      nodesRef.current = allNodes
      setNodes(allNodes)

      canvas?.stopSimulation()
      canvas?.addNodes(n)

      timeoutIdsRef.current.push(
        setTimeout(() => {
          addLog('> Releasing injection... brace for impact.')
          nodesRef.current.forEach((node) => {
            node.gridLocked = false
            node.fx = null
            node.fy = null
          })
          canvas?.reheatAlpha(0.8)
        }, 600),
      )

      timeoutIdsRef.current.push(
        setTimeout(() => {
          const l = generateLinks(allNodes)
          setLinks(l)
          canvas?.addLinks(l)
        }, 700),
      )

      timeoutIdsRef.current.push(setTimeout(() => setRound(4), 5000))
    }

    if (round === 4) {
      addLog('> Outrage cascade initiated.')
      addLog('> Journalist nodes en route...')
      const n = generateNodes(4, nodesRef.current, analysis, w, h)
      const allNodes = [...nodesRef.current, ...n]
      const l = generateLinks(allNodes)
      nodesRef.current = allNodes
      setNodes(allNodes)
      setLinks(l)
      canvas?.addNodes(n)
      canvas?.addLinks(l)
      timeoutIdsRef.current.push(setTimeout(() => setRound(5), 4000))
    }

    if (round === 5) {
      addLog('> ⚠⚠ SYSTEM OVERLOAD.')
      addLog('> PEAK HOSTILITY REACHED.')
      addLog('> Neural pathways degrading...')
      canvas?.reheatAlpha(1.0)
      const n = generateNodes(5, nodesRef.current, analysis, w, h)
      const allNodes = [...nodesRef.current, ...n]
      const l = generateLinks(allNodes)
      nodesRef.current = allNodes
      setNodes(allNodes)
      setLinks(l)
      canvas?.addNodes(n)
      canvas?.addLinks(l)
      timeoutIdsRef.current.push(setTimeout(() => setRound(6), 5000))
    }

    if (round === 6) {
      addLog('> Simulation complete.')
      addLog('> Only the noise remains.')
      canvas?.stopSimulation()
      canvas?.applyGreyscale()
      timeoutIdsRef.current.push(setTimeout(() => setShowReport(true), 800))
    }
  }, [addLog, analysis, round])

  useEffect(
    () => () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id))
    },
    [],
  )

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <NetworkCanvas
        ref={canvasRef}
        nodes={nodes}
        links={links}
        round={round}
        onTooltipChange={setTooltip}
        onNodeClick={handleNodeClick}
        selectedNodeId={selectedNode?.id ?? null}
      />
      <LogOverlay messages={logs} />
      <NodeTooltip
        state={
          selectedNode
            ? { visible: false, x: 0, y: 0, node: null }
            : tooltip
        }
      />
      <NodeIntelligence
        node={selectedNode}
        allNodes={canvasRef.current?.getNodes() ?? nodes}
        allLinks={canvasRef.current?.getLinks() ?? links}
        onClose={() => setSelectedNode(null)}
        onSelectNode={(n) => setSelectedNode(n)}
      />
      <ThreatReport analysis={analysis} visible={showReport} />
    </div>
  )
}
