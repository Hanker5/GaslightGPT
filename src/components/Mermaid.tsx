import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
}

// Initialize mermaid with theme-aware settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    // Primary elements
    primaryColor: '#c4b5fd',
    primaryTextColor: '#000000',
    primaryBorderColor: '#7c3aed',

    // Lines and arrows
    lineColor: '#374151',
    arrowheadColor: '#374151',

    // Secondary/tertiary
    secondaryColor: '#fed7aa',
    secondaryTextColor: '#000000',
    secondaryBorderColor: '#f97316',
    tertiaryColor: '#e0e7ff',
    tertiaryTextColor: '#000000',
    tertiaryBorderColor: '#6366f1',

    // Background
    background: '#ffffff',
    mainBkg: '#ddd6fe',
    secondBkg: '#fecaca',

    // Text
    textColor: '#000000',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: '16px',

    // Borders
    border1: '#7c3aed',
    border2: '#6366f1',

    // Notes (sequence diagrams)
    noteBkgColor: '#fef3c7',
    noteTextColor: '#000000',
    noteBorderColor: '#f59e0b',

    // Actors (sequence diagrams)
    actorBkg: '#ddd6fe',
    actorBorder: '#7c3aed',
    actorTextColor: '#000000',
    actorLineColor: '#374151',

    // Labels
    labelBoxBkgColor: '#ddd6fe',
    labelBoxBorderColor: '#7c3aed',
    labelTextColor: '#000000',

    // Node colors (flowchart/graph)
    nodeBorder: '#7c3aed',
    clusterBkg: '#f3f4f6',
    clusterBorder: '#9ca3af',
    defaultLinkColor: '#374151',

    // Edge labels
    edgeLabelBackground: '#ffffff',

    // Active/highlight
    activeTaskBkgColor: '#fbbf24',
    activeTaskBorderColor: '#f59e0b'
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
    padding: 20,
    nodeSpacing: 80,
    rankSpacing: 80
  },
  sequence: {
    useMaxWidth: true,
    diagramMarginX: 20,
    diagramMarginY: 20,
    actorMargin: 80,
    width: 180,
    height: 65,
    boxMargin: 15,
    boxTextMargin: 5,
    noteMargin: 15,
    messageMargin: 50,
    mirrorActors: false,
    messageAlign: 'center',
    wrap: true,
    wrapPadding: 10
  }
})

export function Mermaid({ chart }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const renderIdRef = useRef(0)

  useEffect(() => {
    if (!elementRef.current) return

    const renderId = `mermaid-${++renderIdRef.current}-${Date.now()}`

    const renderDiagram = async () => {
      try {
        // Clear previous content
        if (elementRef.current) {
          elementRef.current.innerHTML = ''
        }

        // Render new diagram
        const { svg } = await mermaid.render(renderId, chart)

        if (elementRef.current) {
          elementRef.current.innerHTML = svg

          // Fix SVG sizing to prevent overflow
          const svgElement = elementRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.maxWidth = '100%'
            svgElement.style.height = 'auto'
            svgElement.removeAttribute('height')
          }
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error)
        if (elementRef.current) {
          elementRef.current.innerHTML = `
            <div class="text-red-500 text-sm p-4 border border-red-300 rounded bg-red-50 dark:bg-red-950/20">
              Failed to render diagram
            </div>
          `
        }
      }
    }

    renderDiagram()
  }, [chart])

  return (
    <div className="mermaid-wrapper w-full overflow-x-auto">
      <div
        ref={elementRef}
        className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-border min-w-0"
      />
    </div>
  )
}
