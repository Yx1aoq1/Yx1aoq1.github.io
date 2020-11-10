## Vue响应式原理

在 Vue 2.x 版本中，实现数据双向绑定的主要原理就是通过数据劫持的方式，即`Object.defineProperty的`getter`和`setter`方法，配合发布-订阅模式，来监听到数据的赋值与变化，从而通知相关的视图进行更新。

那么，具体是怎么实现的呢？

### Object.defineProperty

首先，我们先了解一下最核心的`Object.defineProperty`的基本用法：

```
Object.defineProperty(obj, prop, descriptor)
```

* obj：要定义属性的对象
* prop：要定义或修改的属性的名称或Symbol
* descriptor：要定义或修改的属性描述符，包含以下属性：
  * `configurable`：当且仅当该属性的 `configurable` 键值为 `true` 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。**默认为** **`false`**。
  * `enumerable`：当且仅当该属性的 `enumerable` 键值为 `true` 时，该属性才会出现在对象的枚举属性中。**默认为 `false`**。
  * `value`：该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。**默认为`undefined`**。
  * `writable`：当且仅当该属性的 `writable` 键值为 `true` 时，属性的值，也就是上面的 `value`，才能被赋值。**默认为`false`**。
  * `get`：属性的 getter 函数，如果没有 getter，则为 `undefined`。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 `this` 对象（由于继承关系，这里的`this`并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。**默认为`undefined`**。
  * `set`：属性的 setter 函数，如果没有 setter，则为 `undefined`。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 `this` 对象。**默认为`undefined`**。

**注意点**： `get`和`set`不能和`writable`及`value`共存，否则浏览器会报错

```
Uncaught TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute, #<Object>
    at Function.defineProperty (<anonymous>)
    at <anonymous>:1:8
```

**▼简单示例**

```js
let obj = {}
let value = null
Object.defineProperty(obj, 'property1', {
  set: function (val) {
    console.log('set value')
    value = val
  },
  get: function () {
    console.log('get value')
    return value
  }
})

// 执行赋值
obj.property1 = 1
// 输出：set value 1

// 获取值
obj.property1
// 输出：get value 1
```

### 实例化一个Vue对象

以下面一个简单的Vue实例作为分析参考：

```html
<div id="app" @click="changeMsg">
  {{ message }}
</div>
```

```js
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  methods: {
    changeMsg () {
      this.message = 'Hello World!'
    }
  }
})
```

当我们`new`出一个Vue实例之后，对`data`主要做了如下的初始化操作：

```js
function initData (vm) {
  // 拿到传入配置中的data
  let data = vm.$options.data
  // data有可能是函数的形式传入，需要做一下判断
  data = vm._data = typeof data === 'function'
  	? getData(data, vm)
  	: data || {}
  
  const keys = Object.keys(data)
  let i = keys.lengths
  while (i--) {
    const key = keys[i]
    // 将data中的数据代理到vm上
    proxy(vm, `_data`, key)
  }
  // 监听对象更新（批量设置对象的set与get）
  observe(data)
}
```

#### proxy

在Vue中，在`props`和`data`中定义的属性，我们都可以在这个Vue实例中通过`this.xxx`获取到。要实现这一目的，我们需要通过**代理**的方式：

```js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: undefined,
  set: undefined
}

export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

`proxy`的本质就是通过 `Object.defineProperty` 把 `target[sourceKey][key]` 的读写变成了对 `target[key]` 的读写。对于 `data` 而言，对 `vm._data.xxxx` 的读写变成了对 `vm.xxxx` 的读写，而对于 `vm._data.xxxx` 我们可以访问到定义在 `data` 函数返回对象中的属性，所以我们就可以通过 `vm.xxxx` 访问到定义在 `data` 函数返回对象中的 `xxxx` 属性。

#### observe

当我们改变`this.message`的值时，需要通知视图也进行更新。这里的`observe`方法就是用来监听数据的变化的：

```js
export function observe (value) {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  
  return new Observer(value)
}
```

`observe` 方法的作用就是将我们需要监听变化的数据，实例化为一个`Observer`对象实例。

#### Observer

`Observer`类的作用，就是给对象的属性加上`getter`和`setter`，用于依赖收集和派发更新：

```js
export class Observer {
  constructor (value) {
    this.value = value
    if (Array.isArray(value)) {
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i ++) {
      observe(items[i])
    }
  }
}
```

#### defineReactive

`defineReactive` 的功能就是定义一个响应式对象，给对象动态添加 getter 和 setter

```js
export function defineReactive (obj, key) {
  const dep = new Dep()
  let value = obj[key]
  let childOb = observe(value)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return val
    },
    set: function reactiveSetter (newVal) {
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      value = newVal
      childObj = observe(newVal)
      dep.notify()
    }
  })
}
```

