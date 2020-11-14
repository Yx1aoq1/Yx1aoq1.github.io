---
title: Vue响应式原理（01）
categories:
  - Vue
tags:
  - Vue
date: 2020-11-13 02:09:38
---

## `Vue`响应式原理

在 `Vue 2.x` 版本中，实现数据双向绑定的主要原理就是通过数据劫持的方式，即`Object.defineProperty`的`getter`和`setter`方法，配合发布-订阅模式，来监听到数据的赋值与变化，从而通知相关的视图进行更新。

那么，具体是怎么实现的呢？

### `Object.defineProperty`

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
// 输出：set value

// 获取值
obj.property1
// 输出：get value
```

### 实例化一个`Vue`对象

以下面一个简单的`Vue`实例作为分析参考：

```html
<div id="app">
  <div @click="changeMsg">
    {{ message }}
  </div>
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

#### 数据代理

在`Vue`中，我们定义在`data`的数据可以通过`this.xxx`来获取，主要原因在于`Vue`对`data`中的数据做了一层数据代理：

```js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

```js
function initData (vm) {
  let data = vm.$options.data
  vm._data = data
  // 判断data的类型是object
  if (!isPlainObject(data)) {
    data = {}
  }
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    // 数据代理
    proxy(vm, `_data`, key)
  }
  observe(data, true /* asRootData */)
}
```

代理的实现方式并不难，通过`Object.defineProperty`把`target[sourceKey][key]`的读写变成了对`target[key]`的读写。

**为什么这样处理呢？**

* **方便读取**：比起用`this._data.xxx`来读取，这样的方式更加直接方便
* **保证数据统一**：为了实现`this.xxx`的方式获取，当然也可以通过`for`循环把数据一个一个赋值到实例上（methods的处理方式），但是这样做就会导致维护了两份数据，增加了维护的成本
* **不影响依赖的收集与更新**：当对`this.xxx`进行读取的时候，就会触发`_data.xxx`中的`get`与`set`方法，不会影响到`data`中数据的依赖收集与更新

#### 数据劫持

因为我们需要在`data`数据更新的时候，通知视图的更新，因此我们对`data`中的每一个数据都生成对应的响应式对象，给对象的每一个属性都加上`getter`与`setter`，在`getter`与`setter`中插入消息绑定与发布的动作。

```js
// observe 的作用，就是判断传入的value是否符合条件
// 对符合条件的对象，生成一个Observer对象实例
export function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  let ob
  if (
    // 判断是否已经定义过响应对象，避免重复定义
    hasOwn(value, '__ob__') && value.__ob__ instanceof Observer
  ) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

```js
// Observer的作用就是将传入的value中的每个属性批量处理
// defineReactive就是处理添加getter与setter的方法
export class Observer {
  constructor (value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 对已生成响应对象的value增加__ob__属性进行标识
    def(value, '__ob__', this)
    this.walk(value)
  }
  // PS: 这里只放了对于Object类型的处理，Array类型的处理需要另外的考虑
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}
```
```js
export function defineReactive (obj, key, val) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 监听当前val的所有子属性
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        // 依赖收集
        dep.depend()
        // 存在子属性的响应对象，需要对子属性也进行依赖的收集
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      val = newVal
      // 对新的值进行设置响应对象，保证数据响应式
      childOb = observe(newVal)
      // 派发更新
      dep.notify()
    }
  })
}
```

通过`defineReactive`初始化`Dep`对象实例，接着拿到`obj`的属性描述符，然后对子对象进行递归调用`ovserve`方法，这样就保证了无论`obj`的结构多复杂，它的所有子属性也能变成响应式的对象，这样我们访问或修改`obj`中一个嵌套较深的属性，也能触发`getter`与`setter`。

#### 依赖收集

在`defineReactive`中，我们实例化了一个`Dep`对象，**`Dep`扮演的对象实际上就是发布-订阅模式中的订阅器，或者说是调度中心**。

```js
let uid = 0

export default class Dep {
  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }

  removeSub (sub) {
    remove(this.subs, sub)
  }

  depend () {
    // 依赖收集，如果当前有正在处理的Wacter
    // 将该Dep放进当前Wacter的deps中
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // slice的作用是复制当前的subs队列
    // 循环处理队列中的每个Watcher的update方法
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
// 标记全局唯一的一个正在处理的Watcher
// 在同一时间内，控制只有一个Watcher正在执行
Dep.target = null
// 待处理的Watcher队列
const targetStack = []

export function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}
```

在`Dep`类中，定义了一个静态属性`target`，是为了存储全局唯一的`Watcher`。因为我们在操作数据的时候，必然会涉及到数据的读取，但是我们只需要收集到需要`Watcher`的对象的依赖就好了，因此需要用`Dep.target`来判断是否要进行依赖收集，因为只有在生成`Watcher`时，`Dep.target`才会被赋值。并且在同一段时间内，只能处理一个`Watcher`。

而`Watcher`所扮演的角色就是观察者，它的主要作用就是为我们需要观察的属性提供回调与收集依赖，当被观察的值发生变化时，就会受到来着`dep`的通知，从而触发回调函数。

```js
let uid = 0

export default class Watcher {
  constructor (
    vm,
    expOrFn,
    cb
  ) {
    this.vm = vm
    this.cb = cb
    this.id = ++uid
    this.deps = []
    this.depIds = new Set()
    this.expression = expOrFn.toString()
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
      }
    }
    this.value = this.get()
  }

  get () {
    pushTarget(this)
    const vm = this.vm
    // 这里的 this.getter 会触发对应data的defineProperty
    // 触发后会将这个Watcher添加到Dep的队列中
    let value = this.getter.call(vm, vm)
    // 执行完成后退出Watcher队列
    popTarget()
    return value
  }

  addDep (dep) {
    const id = dep.id
    // 保证同一数据不会被添加多个观察者
    if (!this.depIds.has(id)) {
      // 将自己加入到当前dep的subs队列
      dep.addSub(this)
    }
  }

  update () {
    this.run()
  }

  run () {
    this.getAndInvoke(this.cb)
  }

  getAndInvoke (cb) {
    const value = this.get()
    const oldValue = this.value
    if (value !== oldValue) {
      this.value = value
      cb.call(this.vm, value, oldValue)
    }
  }
}
```

当执行`new Watcher`生成一个新的观察者时，就会执行`Watcher`类中的`get`方法，从而触发数据接触中的`getter`方法，将自身加入到`Dep`的`subs`队列中，以此完成依赖收集。

#### 派发更新

同理，当在代码中出现`this.xxx = xxx`的赋值行为时，就会触发数据劫持的`setter`方法，此时`Dep`会通知`subs`队列中的每一个观察者都执行自身的`update`，以此触发`new Watcher`时所绑定的`callback`函数。

#### 模板编译

在`Vue`中，`render`的实现也是一大核心，这里先略过，用最简单的DOM操作来完成一些简单指令的实现。举例模板语法`{{message}}`，通过正则匹配到`message`，然后生成对应的`Watcher`：

```js
createWatcher: function (node, vm, exp, dir, ext) {
  // 获取对应指令的updater方法
  const updaterFn = updater[dir + 'Updater']
  updaterFn && updaterFn(node, this._getVMVal(vm, exp), undefined, ext)
  // 生成一个Watcher，在每次Dep通知更新时会执行updater
  new Watcher(vm, exp, (value, oldValue) => {
    updaterFn && updaterFn(node, value, oldValue, ext)
  })
}
```

```js
// 更新文本的Updater方法
[DIRECTIVE.TEXT + 'Updater']: function (node, value) {
  node.textContent = isDef(value) ? value : ''
}
```

### 响应流程图

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/vuemvvm.png)

* 相关源代码地址：[Yx1aoq1/mvvm](https://github.com/Yx1aoq1/mvvm)

