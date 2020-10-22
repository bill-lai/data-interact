import listenItem from './listenItem'
import { SPLICE } from '../global'

const getName = (prefix, key) => prefix + SPLICE + key

// 所有对象转成代理
const recurRetro = (prefix, base, events = [], key) => {
  const name = key ? getName(prefix, key) : prefix
  events = [...events, name]

  for (let key in base) {
    if (base[key] instanceof Object) {
      // 封装成代理
      base[key] = recurRetro(name, base[key], events, key)
    }
  }

  return listenItem(events, name, base)
}


export default recurRetro