import { ResponsiveEvent, SPLICE, UPDATE } from '../global'

const KEYEVENT = 1
const OBJEVENT = 0
const SUCCESS = 1
const ERROR = 2
const NOFINISHED = 3

// 通过事件获取最后一个后缀
const getLastName = name => name.substr(name.lastIndexOf(SPLICE) + SPLICE.length)



// 组合事件与key需要监听的事件，并合并所需事件，并组合参数
const combination = (names, deposit, target) => {

  let rets = []

  names.forEach(name => {
    Object.keys(deposit).forEach(key => {
      rets.push({
        name: name + SPLICE + key, 
        args: target ? [deposit[key], target[key]] : [deposit[key]], 
        type: KEYEVENT
      })
    })
  })

  names.forEach(name => {
    let args = [{...deposit}]
    if (target) {
      let tar = {}
      for (let key in deposit) tar[key] = target[key]
      args.push(tar)
    }
    rets.push({name, args: args, type: OBJEVENT})
  })

  return rets
}

// 发送是否需要修改事件
const mutualManage = (() => {
  const fns = {}

  // 父级多次合并发送
  const mutualParent = (name, originNames, deposit, target) => {
    
    const originName = originNames.find(originName => ~originName.indexOf(name))
    let keys
    try {
      keys = originName.split(SPLICE)
    } catch(e) {
      console.error(e)
    }

    keys.shift()

    // 如果需要通知多个参数，则合并参数
    const args = fns[name] ? fns[name]._cache : {}
    const oldArgs = fns[name] ? fns[name]._old_cache : {}

    let fixed = args
    let oldFixed = oldArgs

    while (keys.length) {
      let key = keys.shift()
      fixed[key] = fixed[key] || {}
      oldFixed[key] = oldFixed[key] || {}
      fixed = fixed[key]
      oldFixed = oldFixed[key]
    }

    for (let key in deposit) {
      fixed[key] = deposit[key]
      oldFixed[key] = target[key]
    }

    if (!fns[name]) {
      fns[name] = []
      fns[name]._cache = args
      fns[name]._old_cache = oldArgs


      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let ret = ResponsiveEvent.mutual(name, fns[name]._cache, fns[name]._old_cache)
          fns[name].forEach(fn => fn(ret))
          delete fns[name]
          ret ? resolve() : reject()
        })
      })
    } else {
      // 同个事件一次发送
      return new Promise((resolve, reject) => fns[name].push((ret) => ret ? resolve() : reject()))
    }
  }

  return async (names, deposit, target, alreadyNames) => {
    let originNames = names.filter(({start}) => start).map(({name}) => name)
    names = names.filter(({start}) => !start).map(({name}) => name)
    

    // 如果是直接监听者则直接发送，并发送子项
    let emitArgs = combination(originNames, deposit, target)

    for (let i = 0; i < emitArgs.length; i++) {
      if (!~alreadyNames.indexOf(emitArgs[i].name)) {
        let ret = ResponsiveEvent.mutual(emitArgs[i].name, ...emitArgs[i].args)

        if (!ret) {
          // 如果只是单个属性没完成，则结果为半完成，记录下来，继续其他属性
          if (emitArgs[i].type === OBJEVENT || emitArgs.length === i + 1) {
            return { ret: ERROR };
          } else if (emitArgs[i].type === KEYEVENT) {
            let attr = getLastName(emitArgs[i].name)
            let already = emitArgs.splice(0, i + 1).map(({name}) => name)

            emitArgs.forEach(item => {
              if (getLastName(item.name) === attr) {
                already.push(item.name)
              }
            })

            return { ret: NOFINISHED,  already }
          }
        }
      }
    }

    let promises = []
    // 如果是父级则合并发送
    for (let i = names.length - 1; i >= 0; i--) {
      promises.push(mutualParent(names[i], originNames, deposit, target))
    }

    try {
      await Promise.all(promises)
      return { ret: SUCCESS }
    } catch {
      return { ret: ERROR }
    }
  }
})();



// 完成修改通知
const updateHandle = (() => {

  return (names, deposit) => {
    names = combination(names.map(({name}) => name), deposit, false)
    names.forEach(({name}) => {
      ResponsiveEvent.trigger(`${name}${UPDATE}`)
    })
  }
})();



// 创建发布订阅与决定是否修改函数
export default (deposit, target) => {
  // 记录是否正在缓冲中
  let runStatus = 0
  // 缓冲时入栈
  let keyFns = {}
  // 正在检测进行时
  let checkStatus = 0
  // 等待中的修改
  let readyFns = []


  const resulut = (key, resolve, listNames, success) => {
    
    resolve(success)

    // 销栈，依次通知
    let keys = Object.keys(keyFns)
    while (keys.length) {
      let key = keys[0]
      keys.shift()
      let fns = keyFns[key] 
      while (fns.length) fns.shift()(success)
      delete keyFns[key]
    }

    // 如果确定修改则通知修改
    success && updateHandle(listNames, deposit)

    // 删除缓存
    for (let key in deposit) delete deposit[key]

    // 结束缓冲
    runStatus = 0
    // 结束检测
    checkStatus = 0
    // 执行等待中的函数
    while (readyFns.length) readyFns.shift()();
  }

  const handle = async (key, listNames, resolve, alreadyNames) => {
    // 通知，以返回结果确定是否需要修改
    let achieve = await mutualManage(listNames, deposit, target, alreadyNames)


    // 如果不是半完成则通知修改
    if (achieve.ret !== NOFINISHED) {
      resulut(
        key,
        resolve,
        listNames,
        achieve.ret === SUCCESS
      )
    } else {
      // 记录已经检测过的
      let nalreadyNames = alreadyNames.concat(achieve.already)
      
      let ckey = getLastName(nalreadyNames.pop())
      let fns = keyFns[ckey]

      // 通知不允许修改的key 
      if (fns) {
        delete keyFns[ckey]
        while (fns.length) fns.shift()(false)
        delete deposit[ckey]
      }

      // 如果是当前的修改失败了
      if (key === ckey) {
        delete keyFns[ckey]
        delete deposit[ckey]

        let keys = Object.keys(keyFns)

        if (keys.length === 0) {
          return resulut(key, resolve, listNames, false);
        } else {
          resolve(false)

          key = keys[0]
          let fnArr = keyFns[key]
          resolve = fnArr.shift()
          fnArr.length === 0 && delete keyFns[key]
        }
      }

      // 继续通知
      handle(key, listNames, resolve, nalreadyNames)
    }
  }

  const grentRet = (listNames, key, value, target) => {
    deposit[key] = value

    if (!runStatus) {
      // 开始缓冲
      runStatus = 1
      return new Promise(resolve => 
        setTimeout(() => {
          // 开始检测，检测时不允许其他状态进入
          checkStatus = 1
          handle(key, listNames, resolve, [])
        })
      )
    } else {
      return new Promise(resolve => {
        // 缓冲时入栈
        if (!keyFns[key]) keyFns[key] = []
        keyFns[key].push(r => resolve(r))
      })
    }
  }

  return (listNames, key, value, target) => {
    // 如果是有其他属性正在检测中则等待检测
    if (checkStatus) {
      return new Promise(resolve => {
        readyFns.push(() => {
          grentRet(listNames, key, value).then(r => resolve(r))
        })
      })
    } else {
      return grentRet(listNames, key, value)
    }
  }
};
