import { ResponsiveEvent, UPDATE, SPLICE } from '../global'

const handle = (api, space, last, ...args) =>
  args.length === 1 ? 
    ResponsiveEvent[api](space + last, args[0]) :
    ResponsiveEvent[api](space + SPLICE + args[0] + last, args[1]);



const openApi = (space, data) => {
  const api = {
    stop: (...args) => handle('listen', space, '', ...args),
    removeStop: (...args) => handle('remove', space, '', ...args),
    onceStop: (...args) => handle('once', space, '', ...args),
    update: (...args) => handle('listen', space, UPDATE, ...args),
    onceUpdate: (...args) => handle('once', space, UPDATE, ...args),
    removeUpdate: (...args) => handle('remove', space, UPDATE, ...args),
    origin: data
  }

  return api
}


export default openApi 