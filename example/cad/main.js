
let point1 = responsive({ x: -150, y: -150 })
let point2 = responsive({ x: -150, y: 150 })
let point3 = responsive({ x: 150, y: 150 })
let point4 = responsive({ x: 150, y: -150 })

let line1 = responsive({ points: [point1.api.origin, point2.api.origin] })
let line2 = responsive({ points: [point2.api.origin, point3.api.origin] })
let line3 = responsive({ points: [point3.api.origin, point4.api.origin] })
let line4 = responsive({ points: [point4.api.origin, point1.api.origin] })

let pointEle1 = document.querySelector('#point1')
let pointEle2 = document.querySelector('#point2')
let pointEle3 = document.querySelector('#point3')
let pointEle4 = document.querySelector('#point4')


point1.api.update(() => {
  console.log('-------')
  pointEle1.setAttribute('cx', point1.x)
  pointEle1.setAttribute('cy', point1.y)
})

point2.api.update(() => {
  pointEle2.setAttribute('cx', point1.x)
  pointEle2.setAttribute('cy', point1.y)
})

point3.api.update(() => {
  pointEle3.setAttribute('cx', point1.x)
  pointEle3.setAttribute('cy', point1.y)
})

point4.api.update(() => {
  pointEle4.setAttribute('cx', point1.x)
  pointEle4.setAttribute('cy', point1.y)
})


