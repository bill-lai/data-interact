import { ResponsiveEvent, UPDATE, SPLICE, OLDIDENT } from '../global'
import { isRetofitting } from '../util'

const handle = (api, space, last, ...args) =>
  args.length === 1 ? 
    ResponsiveEvent[api](space + last, args[0]) :
    ResponsiveEvent[api](space + SPLICE + args[0] + last, args[1]);

const getDataOld = (data) => 
  new Proxy(data, {
    get(target, key) {
      if (isRetofitting(data[key])) {
        return getDataOld(data[key])
      } else {
        return target[OLDIDENT + key]
      }
    },
    set(target, key) {
      return false
    }
  })


const openApi = (space, data) => {
  const api = {
    stop: (...args) => handle('listen', space, '', ...args),
    removeStop: (...args) => handle('remove', space, '', ...args),
    onceStop: (...args) => handle('once', space, '', ...args),
    update: (...args) => handle('listen', space, UPDATE, ...args),
    onceUpdate: (...args) => handle('once', space, UPDATE, ...args),
    removeUpdate: (...args) => handle('remove', space, UPDATE, ...args),
    destroy: () => {
      
    },
    origin: data,
    old: getDataOld(data)
  }

  return api
}


export default openApi 