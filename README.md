# data-interact
深度监听数据，并且可以拦截对数据的修改，以事件监听，代理为核心驱动

### 安装
```javascript
npm install data-interact
```

### 使用
```
import responsive from 'data-interact'

const line1 = responsive({
  line: {
    points: [
      {x: 0, y: 0},
      {x: 1, y: 1}
    ]
  }
})

const point1 = responsive({x: 0, y: 0})
const point2 = responsive({x: 1, y: 1})
const line2 = responsive({
  line: {
    points: [point1.api.origin. point2.api.origin] 
  }
})

// 直接拦截宿主修改，参数为修改的路径，返回false 则不修改
line1.api.stop(({ points }) => {
  if (points.length !== 2) 
    return false;
})

// 拦截宿主下的某个属性
line1.api.stop('points.0', (point) => {
  if (point.x > 10) 
    return false;
})

//修改无效
line1.points = 2
line1.points[0].x = 18

//修改有效
line1.points = [
  {x: 1, y: 1},
  {x: 2, y: 2}
]
line1.points[0].x = 9
```

### API
|  方法   | 说明  | 回调参数 | 回调应返回 |
|  ----  | ----  | ---- |  ---- |
| stop([local], calaabck)  | 拦截指定参数修改 <br> local: string 拦截路径, 可选 <br> callback: function 回调函数，可在回调函数中返回对象，该对象key对应修改key时将覆盖上一次的修改，如返回{x: -1} 那么x将永远是-1 | 被修改的对象 | false \| {(key: string): any} |
| removeStop([local], calaabck)  | 移除拦截函数 <br>local: string 拦截路径, 可选 <br> callback: function 回调函数 |
| onceStop([local], calaabck)  |  拦截一次指定参数修改 <br> local: string 拦截路径, 可选 <br> callback: function 回调函数，可在回调函数中返回对象，该对象key对应修改key时将覆盖上一次的修改，如返回{x: -1} 那么x将永远是-1 | 被修改的对象 | false \| {(key: string): any} |
| update([local], calaabck)  | 监听对象发生改变时 <br>local: string 拦截路径, 可选 <br> callback: function 回调函数 | 被修改的对象 |
| removeUpdate([local], calaabck)  | 移除监听对象发生改变时 <br>local: string 拦截路径, 可选 <br> callback: function 回调函数 |  
| onceUpdate([local], calaabck)  | 监听一次对象发生改变时 <br>local: string 拦截路径, 可选 <br> callback: function 回调函数 | 被修改的对象 |
| nextTick([local], calaabck)  | 当数据下次变化时，注意只有当属性不再修改队列中或没有修改才会触发回调 <br>local: string 拦截路径, 可选 <br> callback: function 回调函数 | void |
| setPattern(isAsync)  | 设置当前模式， <br>isAsync: boolean 同步还是异步 <br>同步模式下不会发送 stop事件提供检查，会直接修改成功，并发送update事件
| void |


### Attr
|  属性   | 说明  | 
|  ----  | ----  |
| origin | 没有被代理前的对象 |
| old | 被修改前的值，再拦截期间直接用对象获取值将拿到拦截期间的值，再拦截后才会变成真值，用此属性可以获取到真正的值|