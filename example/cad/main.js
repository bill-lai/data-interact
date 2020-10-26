
const SVGURI = 'http://www.w3.org/2000/svg'
const $container = document.querySelector('#container')
const critical = [300, 300]
const datas = {
  points: [
    { id: 1, x: -150, y: -150 },
    { id: 2, x: -150, y: 150 },
    { id: 3, x: 150, y: 150 },
    { id: 4, x: 150, y: -150 }
  ],
  lines: [
    [1, 2], [2, 3], [3, 4], [4, 1]
  ]
}

$container.parentElement.setAttribute('width', critical[0] * 2)
$container.parentElement.setAttribute('width', critical[1] * 2)
$container.parentElement.setAttribute('viewBox', `0 0 ${critical[0] * 2} ${critical[1] * 2}`)
$container.setAttribute('transform', `translate(${critical[0]},${critical[1]})`);



function analysis() {
  const points = datas.points.map(point => responsive(point))
  const lines = datas.lines.map(line => {
    return responsive({
      points: [
        points.find((point) => point.id === line[0]).api.origin,
        points.find((point) => point.id === line[1]).api.origin
      ]
    })
  })

  return {lines, points}
}


function domBind({lines, points}) {
  lines.forEach(line => {
    let $line = document.createElementNS(SVGURI, 'path')
    $line.setAttribute('stroke', 'rgb(0,0,0)')
    $line.setAttribute('stroke-width', 3)
    $line.setAttribute('stroke-linecap', 'this')
    $line.setAttribute('d', `M ${line.points[0].x} ${line.points[0].y} L ${line.points[1].x} ${line.points[1].y}`)
    
    $container.appendChild($line)

    line.dom = $line
  })

  points.forEach(point => {
    let $point = document.createElementNS(SVGURI, 'ellipse')
    $point.setAttribute('fill', 'rgb(0, 200, 175)')
    $point.setAttribute('rx', '4')
    $point.setAttribute('ry', '4')
    $point.setAttribute('stroke', 'green')
    $point.setAttribute('stroke-width', '0')
    $point.setAttribute('cx', point.x)
    $point.setAttribute('cy', point.y)
    
    $container.appendChild($point)

    point.dom = $point
  })
}


function bindMouseOper(points) {
  let $mouseCt = document.documentElement
  points.forEach(point => {
    point.dom.addEventListener('mousedown', ev => {
      let init = { x: point.x, y: point.y }
      let start = { x: ev.offsetX, y: ev.offsetY }

      function moveHandle(ev) {
        let end = {x: ev.offsetX, y: ev.offsetY}
        point.x = init.x + end.x - start.x
        point.y = init.y + end.y - start.y
      }

      function upHandle() {
        $mouseCt.removeEventListener('mousemove', moveHandle)
        $mouseCt.removeEventListener('mouseup', upHandle)
      }

      $mouseCt.addEventListener('mousemove', moveHandle)
      $mouseCt.addEventListener('mouseup', upHandle)
    })
  })
};


function bindUpdate({points, lines}) {
  points.forEach(point => {

    point.api.listen('x', () => {
      let ret = point.x > -critical[0] && point.x < critical[1]

      console.log(ret)
      return ret
    })

    // 响应数值变化
    point.api.update('x', () => point.dom.setAttribute('cx', point.x))
    point.api.update('y', () => point.dom.setAttribute('cy', point.y))
  })

  lines.forEach(line => {

    
    // 响应当点数值变化
    line.api.listen('points', () => {
      line.dom.setAttribute('d', `
        M ${line.points[0].x} ${line.points[0].y} 
        L ${line.points[1].x} ${line.points[1].y}
      `)
    })
  })
}

let data = analysis(datas)

domBind(data)
bindMouseOper(data.points)
bindUpdate(data)