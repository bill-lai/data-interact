import { generateUUID } from './util'
import recurRetro from './core/recurRetro'
import grentApi from './api'


// 响应式封装并加装
const responsive = (base) => {
  const space = generateUUID()
  const data = recurRetro(space, base)
  const api = grentApi(space, data)


  return new Proxy(data, {
    get(target, key) {
      return key === 'api' ? api : target[key]
    },
    set(target, key, val) {
      return Reflect.set(...arguments);
    }
  })
}

global.responsive = responsive

export default responsive