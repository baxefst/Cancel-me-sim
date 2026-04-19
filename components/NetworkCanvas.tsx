'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import * as d3 from 'd3'
import type {
  PersonaLink,
  PersonaNode,
  RingEffect,
  SimRound,
  SimulationRefs,
  TooltipState,
} from '@/types'

interface Props {
  nodes: PersonaNode[]
  links: PersonaLink[]
  round: SimRound
  onTooltipChange: (state: TooltipState) => void
  onNodeClick: (node: PersonaNode | null) => void
  selectedNodeId: string | null
}

function linkEndpointId(
  end: PersonaNode | string | number,
): string {
  if (typeof end === 'object' && end !== null && 'id' in end) {
    return end.id
  }
  return String(end)
}

function createBoundsForce(getSize: () => { w: number; h: number }) {
  let boundNodes: PersonaNode[] = []
  function force(_alpha: number) {
    void _alpha
    const { w, h } = getSize()
    const margin = 40
    for (const node of boundNodes) {
      if ((node.x ?? 0) < margin) node.vx = (node.vx ?? 0) + 0.5
      if ((node.x ?? 0) > w - margin) node.vx = (node.vx ?? 0) - 0.5
      if ((node.y ?? 0) < margin) node.vy = (node.vy ?? 0) + 0.5
      if ((node.y ?? 0) > h - margin) node.vy = (node.vy ?? 0) - 0.5
    }
  }
  force.initialize = (nodes: PersonaNode[]) => {
    boundNodes = nodes
  }
  return force
}

const NetworkCanvas = forwardRef<SimulationRefs, Props>(function NetworkCanvas(
  { nodes, links, round, onTooltipChange, onNodeClick, selectedNodeId },
  ref,
) {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<d3.Simulation<PersonaNode, PersonaLink> | null>(null)
  const nodesRef = useRef<PersonaNode[]>([])
  const linksRef = useRef<PersonaLink[]>([])
  const ringsRef = useRef<RingEffect[]>([])
  const rafRef = useRef<number>(0)
  const roundRef = useRef<SimRound>(round)
  const dprRef = useRef<number>(1)
  const sizeRef = useRef({ w: 0, h: 0 })
  const ringTimerRef = useRef<Map<string, number>>(new Map())
  const overloadFlickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const selectedNodeIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId
  }, [selectedNodeId])

  const drawLoop = useCallback((timestamp: number) => {
    const main = mainCanvasRef.current
    const overlay = overlayCanvasRef.current
    if (!main || !overlay) {
      rafRef.current = requestAnimationFrame(drawLoop)
      return
    }

    const ctx = main.getContext('2d')
    const octx = overlay.getContext('2d')
    if (!ctx || !octx) {
      rafRef.current = requestAnimationFrame(drawLoop)
      return
    }

    const { w, h } = sizeRef.current
    const currentRound = roundRef.current

    nodesRef.current
      .filter((n) => n.persona === 'Outraged')
      .forEach((node) => {
        const last = ringTimerRef.current.get(node.id) ?? 0
        const activeForNode = ringsRef.current.filter((r) => r.nodeId === node.id).length
        if (timestamp - last > 1500 && activeForNode < 3) {
          ringsRef.current.push({
            nodeId: node.id,
            radius: node.radius,
            alpha: 0.6,
            startTime: timestamp,
          })
          ringTimerRef.current.set(node.id, timestamp)
        }
      })
    ringsRef.current.forEach((ring) => {
      ring.radius += 1.8
      ring.alpha -= 0.011
    })
    ringsRef.current = ringsRef.current.filter((ring) => ring.alpha > 0)

    ctx.save()
    ctx.clearRect(0, 0, w, h)

    if (currentRound === 5) {
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
    }

    const selectedId = selectedNodeIdRef.current
    const connectedNodeIds = new Set<string>()
    const connectedLinkIds = new Set<string>()
    if (selectedId) {
      linksRef.current.forEach((link) => {
        const sId = linkEndpointId(link.source as PersonaNode | string)
        const tId = linkEndpointId(link.target as PersonaNode | string)
        if (sId === selectedId || tId === selectedId) {
          connectedLinkIds.add(link.id)
          if (sId === selectedId) connectedNodeIds.add(tId)
          else connectedNodeIds.add(sId)
        }
      })
    }

    linksRef.current.forEach((link) => {
      const source = link.source as PersonaNode
      const target = link.target as PersonaNode
      if (source.x == null || source.y == null || target.x == null || target.y == null) return
      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)
      if (selectedId) {
        if (connectedLinkIds.has(link.id)) {
          ctx.strokeStyle = link.color
          ctx.globalAlpha = 1
          ctx.lineWidth = 1.2
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.01)'
          ctx.lineWidth = 0.2
        }
      } else {
        const src = link.source as PersonaNode
        const tgt = link.target as PersonaNode
        const isBotLink =
          src?.persona === 'BotFarm' && tgt?.persona === 'BotFarm'
        ctx.strokeStyle = isBotLink
          ? 'rgba(0,255,65,0.25)'
          : 'rgba(255,255,255,0.06)'
        ctx.lineWidth = isBotLink ? 0.6 : 0.4
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    ringsRef.current.forEach((ring) => {
      const node = nodesRef.current.find((n) => n.id === ring.nodeId)
      if (!node || node.x == null || node.y == null) return
      ctx.beginPath()
      ctx.arc(node.x, node.y, ring.radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,69,0,${ring.alpha})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    nodesRef.current.forEach((node) => {
      ctx.setLineDash([])
      if (node.x == null || node.y == null) return
      const isSel = selectedId === node.id
      const isConn = !isSel && connectedNodeIds.has(node.id)
      const dimUnrelated =
        Boolean(selectedId) && !isSel && !isConn

      ctx.save()
      if (dimUnrelated) {
        ctx.globalAlpha = 0.25
      }
      ctx.shadowBlur = 16
      ctx.shadowColor = node.color

      switch (node.persona) {
        case 'BotFarm': {
          ctx.shadowBlur = 4
          ctx.shadowColor = node.color
          ctx.fillStyle = node.color
          ctx.fillRect(node.x - 2.5, node.y - 2.5, 5, 5)
          break
        }
        case 'Outraged': {
          const pulse = Math.sin(timestamp / 250 + node.pulsePhase)
          const nr = node.isHub ? 18 + pulse * 3 : 8 + Math.abs(pulse) * 5
          ctx.beginPath()
          ctx.arc(node.x, node.y, nr, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
        case 'Stan': {
          const sp = Math.sin(timestamp / 1000 + node.pulsePhase)
          ctx.shadowBlur = 8 + Math.abs(sp) * 14
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
        case 'Journalist': {
          node.dashRotation += 0.01

          ctx.save()
          ctx.translate(node.x, node.y)
          ctx.rotate(node.dashRotation)
          ctx.beginPath()
          ctx.arc(0, 0, node.radius + 4, 0, Math.PI * 2)
          ctx.setLineDash([3, 3])
          ctx.strokeStyle = node.color
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.setLineDash([])
          ctx.restore()

          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
        case 'ReplyGuy': {
          const nx = node.x
          const ny = node.y
          if (nx == null || ny == null) break
          nodesRef.current.forEach((other) => {
            if (other.id === node.id || other.x == null || other.y == null) return
            const dx = other.x - nx
            const dy = other.y - ny
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 65) {
              ctx.beginPath()
              ctx.moveTo(nx, ny)
              ctx.lineTo(other.x, other.y)
              ctx.strokeStyle = `rgba(6,182,212,${0.25 * (1 - dist / 65)})`
              ctx.lineWidth = 0.3
              ctx.stroke()
            }
          })
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
        case 'IronyPoisoned': {
          if (Date.now() - node.velocitySpikeTimer > 3000) {
            node.vx = (node.vx ?? 0) + (Math.random() - 0.5) * 8
            node.vy = (node.vy ?? 0) + (Math.random() - 0.5) * 8
            node.velocitySpikeTimer = Date.now()
          }
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
        case 'MainCharacter': {
          ctx.shadowBlur = 28
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
        case 'CloutChaser': {
          const cp = (Math.sin(timestamp / 1500 + node.allegiance) + 1) / 2
          ctx.globalAlpha = 0.6 + cp * 0.4
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          ctx.globalAlpha = 1
          break
        }
        default: {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.fill()
          break
        }
      }

      ctx.restore()

      if (selectedId) {
        ctx.save()
        if (isSel) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(255,255,255,0.9)'
          ctx.lineWidth = 2.5
          ctx.stroke()
        } else if (isConn) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2)
          ctx.strokeStyle = `${node.color}88`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
        ctx.restore()
      }
    })

    ctx.setLineDash([])
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
    ctx.globalAlpha = 1

    ctx.restore()

    octx.save()
    octx.clearRect(0, 0, w, h)
    if (currentRound === 6) {
      nodesRef.current
        .filter((n) => n.persona === 'Outraged' || n.persona === 'Journalist')
        .forEach((node) => {
          if (node.x == null || node.y == null) return
          octx.save()
          octx.shadowBlur = 22
          octx.shadowColor = node.color
          octx.beginPath()
          octx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          octx.fillStyle = node.color
          octx.fill()
          octx.restore()
        })
    }
    octx.restore()

    rafRef.current = requestAnimationFrame(drawLoop)
  }, [])

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr

    const stanClusterForce = Object.assign(
      function stanCluster(_alpha: number) {
        void _alpha
        const all = nodesRef.current
        const stanNodes = all.filter((n) => n.persona === 'Stan')
        if (stanNodes.length < 2) return

        const { w, h } = sizeRef.current
        const cx =
          stanNodes.reduce((s, n) => s + (n.x ?? 0), 0) / stanNodes.length
        const cy =
          stanNodes.reduce((s, n) => s + (n.y ?? 0), 0) / stanNodes.length

        stanNodes.forEach((node) => {
          node.vx = (node.vx ?? 0) + (cx - (node.x ?? 0)) * 0.012
          node.vy = (node.vy ?? 0) + (cy - (node.y ?? 0)) * 0.012

          node.vx = (node.vx ?? 0) + (w / 2 - (node.x ?? 0)) * 0.001
          node.vy = (node.vy ?? 0) + (h / 2 - (node.y ?? 0)) * 0.001
        })
      },
      { initialize: () => {} },
    )

    const sim = d3
      .forceSimulation<PersonaNode>()
      .velocityDecay(0.6)
      .alphaDecay(0.015)
      .alphaTarget(0)
      .force('charge', d3.forceManyBody<PersonaNode>().strength(-20))
      .force(
        'center',
        d3
          .forceCenter(window.innerWidth / 2, window.innerHeight / 2)
          .strength(0.05),
      )
      .force('bounds', createBoundsForce(() => sizeRef.current))
      .force(
        'collide',
        d3.forceCollide<PersonaNode>().radius((d: PersonaNode) => d.radius + 3),
      )
      .force(
        'link',
        d3
          .forceLink<PersonaNode, PersonaLink>()
          .id((d: PersonaNode) => d.id)
          .strength((l: PersonaLink) => {
            if (l.isRepulsion) return 0
            return l.strength
          })
          .distance((l: PersonaLink) => {
            if (l.strength >= 1.0) return 25
            if (l.strength >= 0.9) return 35
            if (l.strength >= 0.6) return 70
            return 60
          }),
      )
      .force(
        'stanCluster',
        stanClusterForce as d3.Force<PersonaNode, undefined>,
      )
      .on('tick', () => {
        nodesRef.current.forEach((node) => {
          if (node.gridLocked) {
            node.vx = 0
            node.vy = 0
          }
        })
        const allNodes = nodesRef.current
        allNodes
          .filter((n) => n.persona === 'Outraged')
          .forEach((hub) => {
            allNodes
              .filter(
                (n) =>
                  n.persona === 'Normie' ||
                  n.persona === 'TonePolice' ||
                  n.persona === 'Journalist',
              )
              .forEach((target) => {
                const dx = (target.x ?? 0) - (hub.x ?? 0)
                const dy = (target.y ?? 0) - (hub.y ?? 0)
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 160 && dist > 0) {
                  const force = -80 / (dist * dist)
                  target.vx = (target.vx ?? 0) + (dx / dist) * force
                  target.vy = (target.vy ?? 0) + (dy / dist) * force
                }
              })
          })
      })

    simRef.current = sim

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }

      ;[mainCanvasRef, overlayCanvasRef].forEach((cRef) => {
        const c = cRef.current
        if (!c) return
        c.width = w * dpr
        c.height = h * dpr
        c.style.width = `${w}px`
        c.style.height = `${h}px`
        const ctx = c.getContext('2d')
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.scale(dpr, dpr)
        }
      })

      sim.force('center', d3.forceCenter(w / 2, h / 2).strength(0.05))
      sim.alpha(0.3).restart()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(document.body)
    resize()

    rafRef.current = requestAnimationFrame(drawLoop)

    return () => {
      ro.disconnect()
      sim.stop()
      if (overloadFlickerRef.current) {
        clearInterval(overloadFlickerRef.current)
      }
      cancelAnimationFrame(rafRef.current)
    }
  }, [drawLoop])

  useEffect(() => {
    roundRef.current = round
    const sim = simRef.current
    if (!sim) return

    const scanlineEl = document.getElementById('scanlines')

    if (round === 5) {
      sim.alpha(1.0).alphaTarget(0.3).restart()
      scanlineEl?.classList.add('overload')
      if (overloadFlickerRef.current) {
        clearInterval(overloadFlickerRef.current)
      }
      let high = false
      overloadFlickerRef.current = setInterval(() => {
        if (!scanlineEl) return
        scanlineEl.style.opacity = high ? '0.35' : '0.15'
        high = !high
      }, 60)
    }

    if (round === 6) {
      sim.stop()
      if (mainCanvasRef.current) mainCanvasRef.current.style.filter = 'grayscale(1)'
      if (overlayCanvasRef.current) overlayCanvasRef.current.style.filter = 'none'
      if (overloadFlickerRef.current) {
        clearInterval(overloadFlickerRef.current)
        overloadFlickerRef.current = null
      }
      if (scanlineEl) scanlineEl.style.opacity = '1'
      scanlineEl?.classList.remove('overload')
    }
  }, [round])

  useEffect(() => {
    nodesRef.current = nodes
    const sim = simRef.current
    if (!sim) return
    sim.nodes(nodes)
    const linkForce = sim.force<d3.ForceLink<PersonaNode, PersonaLink>>('link')
    linkForce?.links(links)
    sim.alpha(0.4).restart()
  }, [nodes, links])

  useEffect(() => {
    linksRef.current = links
  }, [links])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const all = nodesRef.current
      let nearest: PersonaNode | null = null
      let minDist = 40

      all.forEach((node) => {
        const dx = (node.x ?? 0) - e.clientX
        const dy = (node.y ?? 0) - e.clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist) {
          minDist = dist
          nearest = node
        }
      })

      if (nearest) onTooltipChange({ visible: true, x: e.clientX, y: e.clientY, node: nearest })
      else onTooltipChange({ visible: false, x: 0, y: 0, node: null })
    },
    [onTooltipChange],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      let nearest: PersonaNode | null = null
      let minDist = 30

      nodesRef.current.forEach((node) => {
        const dx = (node.x ?? 0) - e.clientX
        const dy = (node.y ?? 0) - e.clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist) {
          minDist = dist
          nearest = node
        }
      })

      if (nearest) onNodeClick(nearest)
      else onNodeClick(null)
    },
    [onNodeClick],
  )

  useImperativeHandle(
    ref,
    () => ({
      addNodes(newNodes: PersonaNode[]) {
        if (!simRef.current) {
          console.warn('addNodes called before sim ready')
          return
        }
        newNodes.forEach((n) => {
          if (n.gridLocked && n.x != null && n.y != null) {
            n.fx = n.x
            n.fy = n.y
          }
        })
        const merged = [...nodesRef.current, ...newNodes]
        nodesRef.current = merged
        simRef.current.nodes(merged)
        const lf = simRef.current.force<d3.ForceLink<PersonaNode, PersonaLink>>(
          'link',
        )
        lf?.links(linksRef.current)
        simRef.current.alpha(0.4).restart()
      },
      getLinks: () => linksRef.current,
      getNodes: () => nodesRef.current,
      addLinks(newLinks: PersonaLink[]) {
        const sim = simRef.current
        if (!sim) return
        const merged = [...linksRef.current, ...newLinks]
        linksRef.current = merged
        const lf = sim.force<d3.ForceLink<PersonaNode, PersonaLink>>('link')
        lf?.links(merged)
      },
      setRound(r: SimRound) {
        roundRef.current = r
      },
      reheatAlpha(val: number) {
        simRef.current?.alpha(val).restart()
      },
      stopSimulation() {
        simRef.current?.stop()
      },
      applyGreyscale() {
        if (mainCanvasRef.current) {
          mainCanvasRef.current.style.filter = 'grayscale(1)'
        }
      },
    }),
    [],
  )

  return (
    <div
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div style={{ position: 'fixed', inset: 0 }}>
        <canvas
          ref={mainCanvasRef}
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        />
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 11,
            filter: 'none',
          }}
        />
      </div>
    </div>
  )
})

export default NetworkCanvas
