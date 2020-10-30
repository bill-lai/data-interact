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
  line.api.stop('points', (newPs, oldPs) => {
    console.log(newPs, oldPs)

    return !lines.some(cline => cline !== line && util.isLineIntersect(line, cline))
  })

  // 响应当点数值变化
  line.api.update('points', () => line.dom.setAttribute('d', ` M ${line.points[0].x} ${line.points[0].y}  L ${line.points[1].x} ${line.points[1].y}`))
})

