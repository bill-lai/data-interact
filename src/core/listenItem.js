import { namesManage, SPLICE } from '../global'
import { getNameJoinEvents, isDOM } from '../util'
import eventManage from './eventManage'
import recurRetro from './recurRetro'



// 单独封装每一项
const listenItem = (deposit, currentListName, obj, mutualHandle) => {

  // 转成代理对象
  const proxy = new Proxy(obj, {
    set(target, key, value) {
      const listNames = namesManage.get(proxy)

      if (value === target[key]) return;
      if (!listNames || listNames.length === 0 || isDOM(value)) 
        return target[key] = value


      mutualHandle(listNames, key, value)
        .then(ret => {
          if (!ret) return;

          // 如果卸下原来的代理
          if (namesManage.has(target[key])) {
            unListenItem(target[key], key, currentListName)
          }
          
          // 如果时重新赋予的对象则再度封装
          if (value instanceof Object) {
            target[key] = recurRetro(currentListName, value, listNames.map(({name}) => name), key)
          } else {
            target[key] = value
          }
        })
    },
    get(target, key) {
      // 优先获取缓存中的数据
      return key in deposit ? deposit[key] : target[key]
    }
  })

  return proxy
}



// 解绑代理
const unListenItem = (target, key, currentListName) => {
  currentListName = currentListName + SPLICE + key

  // 当前代理往后所有要删除的
  const delkey = currentListName.substr(0, currentListName.indexOf(SPLICE))
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
    } else {
      namesManage.set(proxy, names)
    }
  })
}




// 是否创建控制函数
const _listenItem = (listNames, currentListName, obj) => {
  // 暂存要修改的属性
  const deposit = {}
  let proxy = obj


  // 标识直接监听者
  listNames = listNames.map((name, i) => ({start: i === listNames.length - 1, name}))

  // 如果本身已经是代理，则直接往事件管理器添加通知事件
  if (namesManage.has(obj)) {
    namesManage.set(obj, [...listNames, ...namesManage.get(obj)])
  } else {
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
    proxy = listenItem(
      deposit,
      currentListName,
      obj,
      eventManage(deposit)
    )

    namesManage.set(proxy, listNames)
  }

  return proxy
}

export default _listenItem