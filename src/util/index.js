import { namesManage,  SPLICE} from '../global'


// 获取唯一标识符
export const generateUUID = () => {
  let d = Date.now();

  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); 
  }

  let temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

  var uuid = temp.replace(/[xy]/g, c => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return uuid;
}


// 获取当前事件关联的所有事件
export const getNameJoinEvents = (currentListName) => {
  let index = currentListName.indexOf(SPLICE)

  if (~index) {
    currentListName = currentListName.substr(0, index)
  }

  let it = namesManage.values()
  let parentValue 
  let result = it.next()

  while (!result.done) {
    if (result.value.some(({name, start}) => name === currentListName && start === true)) {
      parentValue = result.value
      break;
    }
    result = it.next()
  }

  return parentValue
}

export const isDOM = typeof HTMLElement === 'object' ? 
  obj => obj instanceof HTMLElement :
  obj => obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'


export const isRetofitting = obj => obj instanceof Object && !isDOM(obj)