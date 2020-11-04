import responsive from '../../../src/index'

export const WIDTH = 800
export const HEIGHT = 800
export const $container = document.querySelector('#container')
export const SVGURI = 'http://www.w3.org/2000/svg'

const data = {
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

const points = data.points.map(point => responsive(point))
global.points = points
const lines = data.lines.map((line, i) => {
  return responsive({
    id: i,
    points: [
      points.find((point) => point.id === line[0]).api.origin,
      points.find((point) => point.id === line[1]).api.origin
    ]
  })
})

let test = responsive({
  points: lines[0].points
})

global.lines = lines
global.test = test
export { lines, points }