
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


const util = {
  
  /**
   * 判断两条线段是否相交
   * @param {*} line1 
   * @param {*} line2 
   */
  isLineIntersect: (line1, line2) => {
    var a1 = line1.points[1].y - line1.points[0].y;
    var b1 = line1.points[0].x - line1.points[1].x;
    var c1 = a1 * line1.points[0].x + b1 * line1.points[0].y;
    //转换成一般式: Ax+By = C
    var a2 = line2.points[1].y - line2.points[0].y;
    var b2 = line2.points[0].x - line2.points[1].x;
    var c2 = a2 * line2.points[0].x + b2 * line2.points[0].y;
    // 计算交点		
    var d = a1 * b2 - a2 * b1;

    // 当d==0时，两线平行
    if (d == 0) {
      return false;
    } else {
      var x = (b2 * c1 - b1 * c2) / d;
      var y = (a1 * c2 - a2 * c1) / d;

      // 检测交点是否在两条线段上
      if ((isInBetween(line1.points[0].x, x, line1.points[1].x) || isInBetween(line1.points[0].y, y, line1.points[1].y)) &&
        (isInBetween(line2.points[0].x, x, line2.points[1].x) || isInBetween(line2.points[0].y, y, line2.points[1].y))) {
        return true;
      }
    }

    function isInBetween(a, b, c) {
      // 如果b几乎等于a或c，返回false.为了避免浮点运行时两值几乎相等，但存在相差0.00000...0001的这种情况出现使用下面方式进行避免

      if (Math.abs(a - b) < 0.000001 || Math.abs(b - c) < 0.000001) {
        return false;
      }

      return (a <= b && b <= c) || (c <= b && b <= a);
    }

    return false;
  }

}


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
  
  return {lines, points}
}


function bindMouseOper({points, lines}) {
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

  lines.forEach(line => {
    line.dom.addEventListener('mousedown', ev => {
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
  })

  
  return {lines, points}
};


function bindUpdate({points, lines}) {
  points.forEach(point => {
    // 检测值是否能修改
    point.api.listen('x', x => {
      console.log('point.x')
      return x > -critical[0] && x < critical[1]
    })
    point.api.listen('y', y => y > -critical[0] && y < critical[1])

    // 响应数值变化
    point.api.update('x', () => {
      point.dom.setAttribute('cx', point.x)
    })
    point.api.update('y', () => point.dom.setAttribute('cy', point.y))
  })
  

  lines.forEach(line => {
    // 检测值是否能修改
    line.api.listen('points', () => {
      console.log('line.points')
      return !lines.some(cline => cline !== line && util.isLineIntersect(line, cline))
    })

    // 响应当点数值变化
    line.api.update('points', () => {
      line.dom.setAttribute('d', `
        M ${line.points[0].x} ${line.points[0].y} 
        L ${line.points[1].x} ${line.points[1].y}
      `)
    })
  })

  
  return {lines, points}
}


let data = bindUpdate(
  bindMouseOper(
    domBind(analysis(datas))
  )
)

