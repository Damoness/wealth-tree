import React, { ReactElement } from 'react'
import { pairs } from 'd3'
import { orderBy } from 'lodash'

const ANGLE_STEP = 0.066 * Math.PI
const ANGLE_STEP_DECAY = 1
const SEGMENT_LENGTH = 4
const SEGMENT_LENGTH_DECAY = 0.95
const MAX = 100

type Props = {
  data: Array<{
    name: string
    decision: string
    sequence: string[]
  }>
  filter: string
}

interface Point {
  x: number
  y: number
  type?: string
}

type LineItem = {
  name: string
  points: Array<Point>
  endPoint: { x: number; y: number; angle: number }
  lines: ReactElement[]
}

type State = {
  hoveredItem: LineItem | null
}

export default class WealthTree extends React.Component<Props, State> {
  lines: Array<LineItem>

  constructor(props: Props) {
    super(props)

    this.state = {
      hoveredItem: null,
    }

    const { data, filter } = props

    this.lines = orderBy(
      data.filter(({ decision }) => decision === filter),
      'sequence.length',
      'asc'
    )
      .slice(0, MAX)
      //.reverse()
      .map((d) => {
        const pen = { x: 0, y: 0 }
        let angleStep = ANGLE_STEP
        let segLength = SEGMENT_LENGTH
        let angle = -0.5 * Math.PI

        const points: Point[] = d.sequence.map((p) => {
          if (p === '0') {
            //
          } else if (p === 'K') {
            angle -= angleStep
          } else {
            angle += angleStep
          }
          pen.x += Math.cos(angle) * segLength
          pen.y += Math.sin(angle) * segLength

          angleStep *= ANGLE_STEP_DECAY
          segLength *= SEGMENT_LENGTH_DECAY

          return { x: pen.x, y: pen.y, type: p }
        })

        points.unshift({ x: 0, y: 0 })

        const lines = pairs(points).map(([a, b]: any, i) => (
          <line key={d.name + i} className={b.type} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))

        const endPoint = { x: pen.x, y: pen.y, angle }

        return {
          ...d,
          points,
          lines,
          endPoint,
        }
      })
  }

  handleContainerClick = () => this.setState({ hoveredItem: null })

  handleLineMouseOver = (d: LineItem) => () =>
    this.setState({
      hoveredItem: d,
    })

  render() {
    console.log('render-WealthTree')

    const { hoveredItem } = this.state

    let hoverEl
    if (hoveredItem) {
      const angleDeg = ((hoveredItem.endPoint.angle * 180) / Math.PI + 360 * 100) % 360
      const flipped = angleDeg > 90 && angleDeg < 270

      hoverEl = (
        <g className="hover">
          <a
            target="_blank"
            //xlinkHref={`http://en.wikipedia.org/wiki/Wikipedia:Articles_for_deletion/${hoveredItem.name}`}
          >
            <g className="bg">{hoveredItem.lines}</g>
            <g>{hoveredItem.lines}</g>
            <g
              transform={`translate(${hoveredItem.endPoint.x}, ${hoveredItem.endPoint.y})rotate(${
                flipped ? angleDeg + 180 : angleDeg
              })`}
            >
              <text
                dx={flipped ? -1 : 1}
                dy={0.75}
                style={{
                  textAnchor: flipped ? 'end' : 'start',
                  fontSize: '2px',
                  stroke: '#FFF',
                  strokeWidth: '1px',
                  strokeOpacity: 0.9,
                }}
              >
                {hoveredItem.name}
              </text>
              <text
                dx={flipped ? -1 : 1}
                dy={0.75}
                style={{
                  textAnchor: flipped ? 'end' : 'start',
                  fontSize: '2px',
                }}
              >
                {hoveredItem.name}
              </text>
            </g>
          </a>
        </g>
      )
    }

    return (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax meet"
        onClick={this.handleContainerClick}
      >
        <g transform="translate(50, 82)">
          <text
            dx={-1.5}
            dy={0}
            textAnchor="end"
            style={{
              fill: '#229b71',
              fontSize: '1.5px',
              fontStyle: 'italic',
            }}
          >
            "正收益"
          </text>
          <text
            dx={1.5}
            dy={0}
            textAnchor="start"
            style={{
              fill: '#982b6f',
              fontSize: '1.5px',
              fontStyle: 'italic',
            }}
          >
            "负收益"
          </text>
          <text
            dx={0}
            dy={6}
            textAnchor="middle"
            style={{
              fill: '#333',
              fontSize: '2.5px',
              fontWeight: '500',
            }}
          >
            {/* {filter == 'D' ? 'The Deleted' : 'The Kept'} */}
            财富之树
          </text>
          {/* <text
            dx={0}
            dy={12}
            textAnchor="middle"
            style={{
              fill: '#777',
              fontSize: '1.5px',
              //fontWeight: "500"
            }}
          >
            <tspan x={0} dy={10}>
              The 100 longest Article for Deletion (AfD) discussions,
            </tspan>
            <tspan x={0} dy={2.5}>
              which resulted in {filter == 'D' ? 'deleting ' : 'keeping, merging, or redirecting '}{' '}
              the article.
            </tspan>
          </text> */}
          {this.lines.map((d) => (
            <g
              onMouseOver={this.handleLineMouseOver(d)}
              key={d.name}
              onTouchStartCapture={this.handleLineMouseOver(d)}
            >
              {d.lines}
            </g>
          ))}
          {hoverEl}
        </g>
      </svg>
    )
  }
}
