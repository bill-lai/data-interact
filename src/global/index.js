import Event from '../core/event'

// 创建空间
export const ResponsiveEvent = Event.create('responsive')
// 分隔符
export const SPLICE = '.'
// 获取名字
export const getName = (prefix, key) => prefix + SPLICE + key
// 名字管理器
export const namesManage = new Map()
// 代理管理器
export const proxyManage = new Map()
// 正在修改的对象映射
export const updateIngs = new Map()
// 要求同步的代理
export const synchroProxy = []
// 更新通知后缀
export const UPDATE = 'Update'
// 正在修改完成后缀
export const UPDATEING = 'UpdateIng'
// 获取修改前的对象
export const OLDIDENT = '__OLD_IDENT__'
