import { namesManage, SPLICE, OLDIDENT, proxyManage, updateIngs, ResponsiveEvent, UPDATEING, synchroProxy, UPDATE } from '../global'
import { getNameJoinEvents, isDOM } from '../util'
import eventManage, { updateHandle } from './eventManage'
import recurRetro from './recurRetro'

const assignment = (target, key, value, currentListName, listNames) => {
  // 如果卸下原来的代理
  if (namesManage.has(target[key])) {
    unListenItem(target[key], currentListName, key)
  }

  // 如果时重新赋予的对象则再度封装
  if (value instanceof Object) {
    target[key] = recurRetro(currentListName, value, listNames.map(({name}) => name), key)
  } else {
    target[key] = value
  }
}


// 单独封装每一项
const _listenItem = (deposit, currentListName, obj, mutualHandle) => {

  // 转成代理对象
  const { proxy, revoke } = Proxy.revocable(obj, {
    set(target, key, value) {
      const listNames = namesManage.get(proxy)

      if (value === target[key]) return Reflect.set(...arguments);
      if (!listNames || listNames.length === 0 || isDOM(value)) {
        target[key] = value
        return Reflect.set(...arguments);
      }

      if (~synchroProxy.indexOf(proxy)) {
        assignment(target, key, value, currentListName, listNames)
        updateHandle(listNames, {[key]: value})
      } else {
        // 记录正在修改的状态
        let vals = updateIngs.get(proxy)
        if (vals) {
          vals.push(key)
        } else {
          vals = [key]
          updateIngs.set(proxy, vals)
        }
        
        mutualHandle(listNames, key, value, target)
          .then(ret => {
            if (ret) {
              assignment(target, key, value, currentListName, listNames)
            }
            
            let index = vals.indexOf(key)
            ~index && vals.splice(index, 1)

            // 如果已经完成了所有修改则通知
            if (!~vals.indexOf(key)) {
              let names = listNames.map(({name}) => name)
              names = names.concat(names.map(name => `${name}${SPLICE}${key}`))

              names.forEach((name) => {
                ResponsiveEvent.trigger(`${name}${UPDATEING}`)
              })
            }
            
            // 删除缓存
            for (let key in deposit) delete deposit[key]
          })

      }
      return true
    },
    get(target, key) {
      if (key.indexOf(OLDIDENT) === 0) {
        return target[key.substr(OLDIDENT.length)]
      } else {
        // 优先获取缓存中的数据
        return key in deposit ? deposit[key] : target[key]
      }
    }
  })

  proxyManage.set(proxy, revoke)

  return proxy
}



// 解绑代理
export const unListenItem = (target, prefixName, key) => {
  let currentListName = key ? prefixName + SPLICE + key : prefixName

  // 当前代理往后所有要删除的
  const delkey = prefixName
  // 要处理的代理
  const proxys = []

  namesManage.forEach((val, key) => {
    // 获取所有与解绑有关的代理
    if (val.some(({name}) => name === currentListName)) {
      proxys.push(key)
    }
  })

  proxys.forEach(proxy => {
    let names = namesManage.get(proxy)
      .filter(({name}) => name.indexOf(delkey) !== 0)

    if (names.length === 0) {
      namesManage.delete(proxy)
      proxyManage.get(proxy)()
      proxyManage.delete(proxy)
      updateIngs.delete(proxy)
    } else {
      namesManage.set(proxy, names)
    }
  })
}




// 是否创建控制函数
export const listenItem = (listNames, currentListName, obj) => {
  let proxy = obj

  // 标识直接监听者
  listNames = listNames.map((name, i) => ({start: i === listNames.length - 1, name}))

  // 如果本身已经是代理，则直接往事件管理器添加通知事件
  if (namesManage.has(obj)) {
    namesManage.set(obj, [...listNames, ...namesManage.get(obj)])
  } else {
    // 暂存要修改的属性
    const deposit = {}
    const parentValue = getNameJoinEvents(currentListName)

    // 如果是正在使用的对象重新赋值，则查看有多少个关联依次添加关联
    if (parentValue) {
      const startVals = parentValue.filter(({start}) => start)
      const tranVal = listNames.find(({start}) => start)
      let suffix
      
      for (let i = 0; i < startVals.length; i++) {
        if (tranVal.name.indexOf(startVals[i].name) === 0) {
          suffix = tranVal.name.substr(startVals[i].name.length)
        }
      }

      if (suffix) {
        listNames = listNames
          .filter(({start}) => !start)
          .concat(startVals.map(item => ({...item, name: item.name + suffix})))
      }
    }

    // 生成代理
    proxy = _listenItem(
      deposit,
      currentListName,
      obj,
      eventManage(deposit, obj)
    )

    namesManage.set(proxy, listNames)
  }

  return proxy
}