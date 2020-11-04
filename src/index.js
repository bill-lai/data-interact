import { generateUUID, isRetofitting } from './util'
import recurRetro from './core/recurRetro'
import grentApi from './api'
import { unListenItem } from './core/listenItem'


// 响应式封装并加装
const responsive = (base) => {
  if (!isRetofitting(base)) return base;
  
  let space = generateUUID()
  let data = recurRetro(space, base, [])
  let api = grentApi(space, data)

  const unbind = (base) => {
    for (let key in base) {
      if (isRetofitting(base[key])) {
        unbind(base[key])
      }
    }
  }

  api.destroy = () => {
    unListenItem(data, space)
    data = space = api = void 0
    revoke()
  }

  let { proxy, revoke } = Proxy.revocable(data, {
    get(target, key) {
      return key === 'api' ? api : target[key]
    },
    set(target, key, val) {
      return Reflect.set(...arguments);
    }
  })

  return proxy
}


export default responsive
