import {lines, points, WIDTH, HEIGHT} from './global'
import util from './util'

const minWidth = -WIDTH / 2
const maxWidth = WIDTH / 2
const minHeight = -HEIGHT / 2
const maxHeight = HEIGHT / 2


points.forEach(point => {
  // 检测值是否能修改
  point.api.stop('x', (x, oldX) => {
    return x > minWidth && x < maxWidth
  })
  point.api.stop('y', y => y > minHeight && y < maxHeight)

  // 响应数值变化
  point.api.update('x', () => point.dom.setAttribute('cx', point.x))
  point.api.update('y', () => point.dom.setAttribute('cy', point.y))
})


lines.forEach(line => {
  // 检测值是否能修改
  // line.api.stop('points', (newPs, oldPs) => {
  //   return !lines.some(cline => cline !== line && util.isLineIntersect(line, cline))
  // })

  let oPoints = [
    line.api.old.points[0],
    line.api.old.points[1]
  ]

  const check = (oldPoint, newPoint) => {
    let clines = lines.map(line => {
      let index = line.points.indexOf(oldPoint)
      if (~index) {
        line = {
          ...line,
          points: {
            ...line.points,
            [index]: newPoint
          }
        }
      }

      return line
    })
    let tline = clines[lines.indexOf(line)]

    let ret = !clines.some(cline => util.isLineIntersect(cline, tline))

    return ret;
  }

  
  line.api.stop('points.0.x', (newPs, oldPs) => 
    check(line.points[0], {y: oPoints[0].y, x: newPs}, 'points.0.x')
  )

  
  line.api.stop('points.0.y', (newPs, oldPs) => 
    check(line.points[0], {x: oPoints[0].x, y: newPs}, 'points.0.y')
  )

  
  line.api.stop('points.1.x', (newPs, oldPs) => 
    check(line.points[1], {y: oPoints[1].y, x: newPs}, 'points.1.x')
  )

  
  line.api.stop('points.1.y', (newPs, oldPs) => 
    check(line.points[1], {x: oPoints[1].x, y: newPs}, 'points.1.y')
  )

  // 响应当点数值变化
  line.api.update('points', () => line.dom.setAttribute('d', ` M ${line.points[0].x} ${line.points[0].y}  L ${line.points[1].x} ${line.points[1].y}`))
})

