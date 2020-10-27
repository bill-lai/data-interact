import listenItem from './listenItem'
import { SPLICE, namesManage } from '../global'
import { isDOM } from '../util'

const getName = (prefix, key) => prefix + SPLICE + key


// 所有对象转成代理
const recurRetro = (prefix, base, events, key, loaded = [base]) => {
  // 如果是dom则不监听
  if (isDOM(base)) {
    return base;
  }

  const name = key ? getName(prefix, key) : prefix
  events = [...events, name]

  // namesManage.has(base[key])
  for (let key in base) {
    if (base[key] instanceof Object && !~loaded.indexOf(base[key])) {

      // 防止循环引用
      loaded.push(base[key])
      // 封装成代理
      base[key] = recurRetro(name, base[key], events, key, loaded)
    }
  }

  return listenItem(events, name, base)
}


export default recurRetro