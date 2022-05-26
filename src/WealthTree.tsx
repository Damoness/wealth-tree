import React from 'react'
import { pairs } from 'd3'
import { observable, makeObservable } from 'mobx'
import { orderBy } from 'lodash'
import { observer } from 'mobx-react'
// import { scaleLinear } from 'd3';

const ANGLESTEP = 0.066 * Math.PI
const ANGLESTEP_DECAY = 1
const SEGMENTLENGTH = 4
const SEGMENTLENGTH_DECAY = 0.95
const MAX = 100

type Props = {
  data: any[]
  filter: string
}

@observer
export default class WealthTree extends React.Component<Props> {
  @observable hoveredItem: any = null

  lines?: any[]

  constructor(props: Props) {
    super(props)
    makeObservable(this)
  }

  render() {
    const { data, filter } = this.props

    const lines =
      this.lines ||
      orderBy(
        data.filter(({ decision }) => decision === filter),
        'sequence.length',
        'desc'
      )
        .slice(0, MAX)
        .reverse()
        .map((d) => {
          // console.log(d.name);
          const pen = { x: 0, y: 0 }
          let angleStep = ANGLESTEP
          let segLength = SEGMENTLENGTH
          let angle = -0.5 * Math.PI
          d.points = d.sequence.map((p: string) => {
            if (p === '0') {
              //
            } else if (p === 'K') {
              angle -= angleStep
            } else {
              angle += angleStep
            }
            pen.x += Math.cos(angle) * segLength
            pen.y += Math.sin(angle) * segLength

            angleStep *= ANGLESTEP_DECAY
            segLength *= SEGMENTLENGTH_DECAY

            return { x: pen.x, y: pen.y, type: p }
          })

          d.points.unshift({ x: 0, y: 0 })

          d.lines = pairs(d.points).map(([a, b]: any, i) => (
            <line key={d.name + i} className={b.type} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ))
          d.endPoint = { x: pen.x, y: pen.y, angle }
          return d
        })

    this.lines = lines

    let hoverEl

    if (this.hoveredItem) {
      const angleDeg = ((this.hoveredItem.endPoint.angle * 180) / Math.PI + 360 * 100) % 360
      const flipped = angleDeg > 90 && angleDeg < 270

      hoverEl = (
        <g className="hover">
          <a
            target="_blank"
            //xlinkHref={`http://en.wikipedia.org/wiki/Wikipedia:Articles_for_deletion/${this.hoveredItem.name}`}
          >
            <g className="bg">{this.hoveredItem.lines}</g>
            <g>{this.hoveredItem.lines}</g>
            <g
              transform={`translate(${this.hoveredItem.endPoint.x}, ${
                this.hoveredItem.endPoint.y
              })rotate(${flipped ? angleDeg + 180 : angleDeg})`}
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
                {this.hoveredItem.name}
              </text>
              <text
                dx={flipped ? -1 : 1}
                dy={0.75}
                style={{
                  textAnchor: flipped ? 'end' : 'start',
                  fontSize: '2px',
                }}
              >
                {this.hoveredItem.name}
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
        onClick={() => (this.hoveredItem = null)}
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
            '财富之树'
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
          {lines.map((d) => (
            <g onMouseOver={() => (this.hoveredItem = d)} key={d.name}>
              {d.lines}
            </g>
          ))}
          {hoverEl}
        </g>
      </svg>
    )
  }
}
