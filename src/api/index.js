import { ResponsiveEvent, synchroProxy, UPDATE, SPLICE, OLDIDENT, updateIngs, UPDATEING } from '../global'
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
  });

const openApi = (space, data) => {

  // 下一次回调
  const nextTick = (...args) => {
    let [name, cb] = args.length === 1 ? ['', args[0]] : args
    let route = name.split(SPLICE)
    name = route.pop()

    // 找到监听最近的proxy
    while (route.length) data = data[route.shift()]
    
    // 获取正在修改种的所有key
    let updateKeys = updateIngs.get(data)

    // 判断是否正在修改
    if (updateKeys && ~updateKeys.indexOf(name)) {
      // 如果正在修改则
      let eventName = (name ? space + SPLICE + name : space) + UPDATEING
      ResponsiveEvent.once(eventName, cb)
    } else {
      // 如果没有正在修改则直接延迟返回
      setTimeout(cb)
    }
  }

  // 设置模式，有同步异步两种模式
  const setPattern = (isAsync) => {
    let index = synchroProxy.indexOf(data)

    if (isAsync) {
      ~index && synchroProxy.splice(index, 1)
    } else {
      ~index || synchroProxy.push(data)
    }
  }

  const api = {
    stop: (...args) => handle('listen', space, '', ...args),
    removeStop: (...args) => handle('remove', space, '', ...args),
    onceStop: (...args) => handle('once', space, '', ...args),
    update: (...args) => handle('listen', space, UPDATE, ...args),
    onceUpdate: (...args) => handle('once', space, UPDATE, ...args),
    removeUpdate: (...args) => handle('remove', space, UPDATE, ...args),
    nextTick,
    setPattern,
    origin: data,
    old: getDataOld(data)
  }

  return api
}


export default openApi 