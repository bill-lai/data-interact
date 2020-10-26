import { ResponsiveEvent, SPLICE, UPDATE } from '../global'

const KEYEVENT = 1
const OBJEVENT = 0
const SUCCESS = 1
const ERROR = 2
const NOFINISHED = 3

// 通过事件获取最后一个后缀
const getLastName = name => name.substr(name.lastIndexOf(SPLICE) + SPLICE.length)

// 组合事件与key需要监听的事件，并合并所需事件，并组合参数
const combination = (names, deposit) => {
  let rets = []

  names.forEach(name => {
    Object.keys(deposit).forEach(key => {
      rets.push({name: name + SPLICE + key, args: deposit[key], type: KEYEVENT})
    })
  })

  names.forEach(name => {
    rets.push({name, args: deposit, type: OBJEVENT})
  })

  return rets
}

// 发送是否需要修改事件
const mutualManage = (() => {
  const fns = {}

  // 父级多次合并发送
  const mutualParent = (name, originNames, deposit) => {
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

    let fixed = args

    while (keys.length) {
      let key = keys.shift()
      fixed[key] = fixed[key] || {}
      fixed = fixed[key]
    }

    for (let key in deposit) {
      fixed[key] = deposit[key]
    }

    if (!fns[name]) {
      fns[name] = []
      fns[name]._cache = args

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let ret = ResponsiveEvent.mutual(name, fns[name]._cache)
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

  return async (names, deposit, alreadyNames) => {
    let originNames = names.filter(({start}) => start).map(({name}) => name)
    names = names.filter(({start}) => !start).map(({name}) => name)
    

    // 如果是直接监听者则直接发送，并发送子项
    let emitArgs = combination(originNames, deposit)

    for (let i = 0; i < emitArgs.length; i++) {
      if (!~alreadyNames.indexOf(emitArgs[i].name)) {
        let ret = ResponsiveEvent.mutual(emitArgs[i].name, emitArgs[i].args)

        if (!ret) {
          if (emitArgs[i].type === OBJEVENT) {
            return { ret: ERROR };
          } else if (emitArgs[i].type === KEYEVENT) {
            let already = emitArgs.splice(0, i + 1).map(({name}) => name)
            return { ret: NOFINISHED,  already }
          }
        }
      }
    }

    let promises = []
    // 如果是父级则合并发送
    for (let i = names.length - 1; i >= 0; i--) {
      promises.push(mutualParent(names[i], originNames, deposit))
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
  const fns = []

  return (names, deposit) => {
    names = combination(names.map(({name}) => name), deposit)

    names.forEach(({name}) => {
      if (!~fns.indexOf(name)) {
        setTimeout(() => {
          ResponsiveEvent.trigger(`${name}${UPDATE}`)
          fns.splice(fns.indexOf(name), 1)
        })
      }
    })
  }
})();



// 创建发布订阅与决定是否修改函数
export default (deposit) => {
  // 记录是否正在缓冲中
  let runStatus = 0
  // 缓冲时入栈
  let keyFns = {}

  const resulut = (resolve, listNames, success) => {
    resolve(success)

    // 销栈，依次通知
    let keys = Object.keys(keyFns)
    while (keys.length) {
      let fns = keyFns[keys.shift()] 
      while (fns.length) fns.shift()(success)
    }

    // 如果确定修改则通知修改
    success && updateHandle(listNames, deposit)

    // 删除缓存
    for (let key in deposit) delete deposit[key]

    // 结束缓冲
    runStatus = 0
    console.log('end')
  }

  const handle = async (key, listNames, resolve, alreadyNames) => {
    // 通知，以返回结果确定是否需要修改
    let achieve = await mutualManage(listNames, deposit, alreadyNames)

    // 如果不是半完成则通知修改
    if (achieve.ret !== NOFINISHED) {
      resulut(
        resolve,
        listNames,
        achieve.ret === SUCCESS
      )
    } else {
      // console.log('----')
      // 记录已经检测过的
      let nalreadyNames = alreadyNames.concat(achieve.already)
      
      let ckey = getLastName(nalreadyNames.pop())
      let fns = keyFns[ckey]

      // 通知不允许修改的key 
        console.log('-------aaaa--------', ckey, key, keyFns)
      if (fns) {
        delete keyFns[ckey]
        while (fns.length) fns.shift()(false)
        delete deposit[ckey]
        console.log('---------------')
      }

      console.log('........')

      // 如果是当前的修改失败了
      if (key === ckey) {
        console.log('....1111111....')
        delete keyFns[ckey]
        delete deposit[ckey]

        let keys = Object.keys(keyFns)

        if (keys.length === 0) {
          return resulut(resolve, listNames, false);
        } else {
          resolve(false)

          let fnArr = keyFns[keys[0]]
          resolve = fnArr.shift()
          fnArr.length === 0 && delete keyFns[keys[0]]
        }
      }

      
      console.log('&&&&&&&&&&&')

      // 继续通知
      handle(key, listNames, resolve, nalreadyNames)
    }
  }

  return (listNames, key, value) => {
    deposit[key] = value
    if (!runStatus) {
      // 开始缓冲
      runStatus = 1
      console.log('start')
      return new Promise(resolve => setTimeout(() => handle(key, listNames, resolve, [])))
    } else {
      return new Promise(resolve => {
        // 缓冲时入栈
        console.log('init', key)
        if (!keyFns[key]) keyFns[key] = []
        keyFns[key].push(resolve)
        console.log('init end')
      })
    }
  }
};
