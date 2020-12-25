import { WIDTH, HEIGHT, SVGURI, $container, lines, points } from './global'

const $mouseCt = document.documentElement

$container.parentElement.setAttribute('width', WIDTH )
$container.parentElement.setAttribute('height', HEIGHT )
$container.parentElement.setAttribute('viewBox', `0 0 ${WIDTH } ${HEIGHT }`)
$container.setAttribute('transform', `translate(${WIDTH / 2}, ${HEIGHT / 2})`);


lines.map(line => {
  let $line = document.createElementNS(SVGURI, 'path')
  $line.setAttribute('stroke', 'rgb(0,0,0)')
  $line.setAttribute('stroke-width', 3)
  $line.setAttribute('stroke-linecap', 'this')
  $line.setAttribute('d', `M ${line.points[0].x} ${line.points[0].y} L ${line.points[1].x} ${line.points[1].y}`)
  
  $line.addEventListener('mousedown', ev => {
    let init0 = { x: line.points[0].x, y: line.points[0].y }
    let init1 = { x: line.points[1].x, y: line.points[1].y }
    let start = { x: ev.offsetX, y: ev.offsetY }

    function moveHandle(ev) {
      let end = {x: ev.offsetX, y: ev.offsetY}
      line.points[0].x = init0.x + end.x - start.x
      line.points[0].y = init0.y + end.y - start.y
      line.points[1].x = init1.x + end.x - start.x
      line.points[1].y = init1.y + end.y - start.y
    }

    function upHandle() {
      $mouseCt.removeEventListener('mousemove', moveHandle)
      $mouseCt.removeEventListener('mouseup', upHandle)
    }

    $mouseCt.addEventListener('mousemove', moveHandle)
    $mouseCt.addEventListener('mouseup', upHandle)
  })

  line.dom = $line

  

  $container.appendChild($line)
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
  

  $point.addEventListener('mousedown', ev => {
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

  // $point.addEventListener('mousedown', ev => {
  //   let start = { x: ev.offsetX, y: ev.offsetY }

  //   function moveHandle(ev) {
  //     let end = {x: ev.offsetX, y: ev.offsetY}
  //     point.x += end.x - start.x
  //     point.y += end.y - start.y
  //     start = end
  //   }

  //   function upHandle() {
  //     $mouseCt.removeEventListener('mousemove', moveHandle)
  //     $mouseCt.removeEventListener('mouseup', upHandle)
  //   }

  //   $mouseCt.addEventListener('mousemove', moveHandle)
  //   $mouseCt.addEventListener('mouseup', upHandle)
  // })

  point.dom = $point
  $container.appendChild($point)
})
