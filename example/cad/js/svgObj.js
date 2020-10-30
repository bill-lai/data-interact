import { data } from './global'

const points = data.points.map(point => responsive(point))
const lines = data.lines.map(line => {
  return responsive({
    points: [
      points.find((point) => point.id === line[0]).api.origin,
      points.find((point) => point.id === line[1]).api.origin
    ]
  })
})

export { lines, points }