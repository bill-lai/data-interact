import Event from '../core/event'

// 创建空间
export const ResponsiveEvent = Event.create('responsive')
// 分隔符
export const SPLICE = '.'
// 获取名字
export const getName = (prefix, key) => prefix + SPLICE + key
// 名字管理器
export const namesManage = new Map()
// 更新通知后缀
export const UPDATE = 'Update'