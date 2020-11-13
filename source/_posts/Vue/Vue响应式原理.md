---
title: Vue响应式原理
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

在`Dep`类中，定义了一个静态属性`target`，是为了存储全局唯一的`Watcher`。因为我们在操作数据的时候，必然会涉及到数据的读取，但是我们只需要收集到需要`Watcher`的对象的依赖就好了，因此需要用`Dep.target`来判断是否要进行数据收集，因为只有在生成`Watcher`时，`Dep.target`才会被赋值。并且在同一段时间内，只能处理一个`Watcher`。

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

在`Vue`中，`render`的实现也是一大核心，这里先略过，用最简单的DOM操作来完成一些简单指令的实现：

```js
const PREFIX = {
  DIRECTIVE: 'v-',
  EVENT: '@',
  ATTR: ':'
}
export default class Compile {
  constructor (el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }

  node2Fragment (el) {
    let child
    // createDocumentFragment 创建文档碎片
    // 主要用法是作为一个文档的“占位符”，当插入到文档中时，会插入它的所有子孙节点
    // 作为一个插入节点的过渡，可以减少渲染DOM元素的次数
    const fragment = document.createDocumentFragment()
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  init () {
    this.compileElement(this.$fragment)
  }

  compileElement (el) {
    const childNodes = el.childNodes
    Array.prototype.slice.call(childNodes, this).forEach(node => {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/
      if (
        // 如果节点是DOM元素
        this.isElementNode(node)
      ) {
        this.compile(node)
      } else if (
        // 如果节点是一个文本，并且包含模板语法{{xxx}}
        this.isTextNode(node) && reg.test(text)
      ) {
        this.compileText(node, RegExp.$1.trim())
      }
      // 递归继续遍历子节点
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile (node) {
    const nodeAttrs = node.attributes
    Array.prototype.slice.call(nodeAttrs, this).forEach(attr => {
      const attrName = attr.name
      const exp = attr.value
      if (
        // 判断v-xxx指令
        this.isDirective(attrName)
      ) {
        const dir = attrName.replace(PREFIX.DIRECTIVE, '')
        compileUtil[dir] && compileUtil[dir](node, this.$vm, exp, dir)
        node.removeAttribute(attrName)
      } else if (
        // 判断@xxx指令
        this.isEventDirective(attrName)
      ) {
        const eventType = attrName.replace(PREFIX.EVENT, '')
        compileUtil.eventHandler(node, this.$vm, exp, eventType)
        node.removeAttribute(attrName)
      } else if (
        // 判断:xxx指令
        this.isAttrDirective(attrName)
      ) {
        const name = attrName.replace(PREFIX.ATTR, '')
        compileUtil.attrHandler(node, this.$vm, exp, name)
        node.removeAttribute(attrName)
      }
    })
  }

  compileText (node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }

  isDirective (attr) {
    return attr.indexOf(PREFIX.DIRECTIVE) === 0
  }

  isAttrDirective (attr) {
    return attr.indexOf(PREFIX.ATTR) === 0
  }

  isEventDirective (attr) {
    return attr.indexOf(PREFIX.EVENT) === 0
  }

  isBindDirective (dir) {
    return dir.indexOf(DIRECTIVE.BIND) === 0
  }

  isElementNode (node) {
    return node.nodeType === 1
  }

  isTextNode (node) {
    return node.nodeType === 3
  }
}

const DIRECTIVE = {
  TEXT: 'text',
  MODEL: 'model',
  ON: 'on',
  BIND: 'bind',
  ATTR: 'attr'
}

const compileUtil = {
  [DIRECTIVE.TEXT]: function (node, vm, exp, dir) {
    this.createWatcher(node, vm, exp, DIRECTIVE.TEXT)
  },

  [DIRECTIVE.ON]: function (node, vm, exp, dir) {
    const eventType = dir.split(':')[1]
    this.eventHandler(node, vm, exp, eventType)
  },

  [DIRECTIVE.MODEL]: function (node, vm, exp, dir) {
    this.createWatcher(node, vm, exp, DIRECTIVE.MODEL)
    const value = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      var newValue = e.target.value
      if (value === newValue) {
        return
      }
      this._setVMVal(vm, exp, newValue)
    })
  },

  createWatcher: function (node, vm, exp, dir, ext) {
    const updaterFn = updater[dir + 'Updater']
    updaterFn && updaterFn(node, this._getVMVal(vm, exp), undefined, ext)
    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue, ext)
    })
  },

  eventHandler: function (node, vm, exp, eventType) {
    const fn = vm.$options.methods && vm.$options.methods[exp]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  attrHandler: function (node, vm, exp, attrName) {
    this.createWatcher(node, vm, exp, DIRECTIVE.ATTR, attrName)
  },

  _getVMVal: function (vm, exp) {
    return parsePath(exp).call(vm, vm)
  },

  _setVMVal: function (vm, exp, value) {
    let val = vm
    const segments = exp.split('.')
    segments.forEach(function(k, i) {
      // 非最后一个key，更新val的值
      if (i < segments.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }
}

const updater = {
  // 更新文本
  [DIRECTIVE.TEXT + 'Updater']: function (node, value) {
    node.textContent = isDef(value) ? value : ''
  },
  // 更新绑定的value
  [DIRECTIVE.MODEL + 'Updater']: function (node, value, oldValue) {
    node.value = isDef(value) ? value : ''
  },
  // 更新attribute
  [DIRECTIVE.ATTR + 'Updater']: function (node, value, oldValue, name) {
    node.setAttribute(name, value)
  }
}
```

可以看到，在模板编译中，针对定义的指令，通过`new Watcher`的方式，将视图与数据绑定在一起，传入对应更新视图的`callback`方法。在每次接收到响应值的更新时，就会执行对应的`updater`方法来完成视图的更新。

### 响应流程图

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/vuemvvm.png)

### 存在的缺陷

使用`Object.defineProperty`来进行依赖收集与派发更新，存在以下缺点：

* 检测不到对象属性的添加和删除：当你在对象上新加了一个属性`newProperty`，当前新加的这个属性将不会经过`defineReactive`的过程，无法触发`Vue`的更新机制，需要手动触发
* 无法监控到数组下标的变化，导致直接通过数组的下标给数组设值，不能实时响应
* 当`data`中的数据层级很深时，会有性能问题，因为要通过递归遍历`data`中所有的数据进行`defineReactive`

```js
class Observer {
  constructor (obj) {
    if (typeof obj !== 'object') {
      return
    }
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      this.defineReactive(obj, keys[i])
    }
  }

  defineReactive (obj, key) {
    let value = obj[key]
    let childOb = new Observer(value)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        console.log('get', key, '=', value)
        return value
      },
      set: function (newVal) {
        if (value === newVal) {
          return
        }
        console.log('set', key, '=', newVal)
        childOb = new Observer(newVal)
        value = newVal
      }
    })
  }
}
```

```js
let obj = {
  a: '1',
}
new Observer(obj)
obj.a = 2
obj.b = 2
// 只输出 set a = 2
// 设置未事先声明的b属性，不会触发setter
let ary = [0]
new Observer(ary)
ary[0] = 1
ary[1] = 2
ary.push(3)
// 只输出set 0 = 1
// 对于原本不存在元素的下标直接设值，不会触发setter
// 使用Array原型上的方法对数组进行修改，也不会触发setter
```

对于`Object`属性的添加与删除，以及`Array`类型通过下标赋值的问题，提供而外的触发函数`set`与`delete`，下面附上实现方式：

```js
export function set (target, key, val) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, value)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = target.__ob__
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

```js
export function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

对于使用`Array`原型方法修改数组的方式，我们需要自己定义一个拦截器覆盖原来的`Array.prototype`，然后在拦截器中触发更新，并使用原生的`Array`原型方法来操作原数组。

拦截器的实现方法：

```js
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)
// Array原型方法，这些方法都能改变数组自身
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(function (method) {
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    // push、unshift、splice都能插入新值
    // 将新值inserted也变成一个响应式对象
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // 触发依赖通知
    ob.dep.notify()
    return result
  })
})
```

在`Observer`类中，我们需要增加对数组类型的值的判断，并加上不一样的处理方式：

```js
export class Observer {
  constructor (value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 对已生成响应对象的value增加__ob__属性进行标识
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 用拦截器替换原来Array上的原型方法
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 将对象的每一个属性都加上getter与setter
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  // 遍历数组中的元素，将他们都变成响应对象
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

对应的`getter`依赖收集方法也要做出一定的调整：

```js
get: function reactiveGetter () {
  const value = getter ? getter.call(obj) : val
  if (Dep.target) {
    // 依赖收集
    dep.depend()
    // 存在子属性的响应对象，需要对子属性也进行依赖的收集
    if (childOb) {
      childOb.dep.depend()
      if(Array.isArray(value)) {
        // 如果是数组，需要对数组的每个元素都进行依赖收集
        dependArray(value)
      }
    }
  }
  return value
},
```

```js
function dependArray (value) {
  // 递归判断元素是否是响应对象，如果是，对其进行依赖收集
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
```

### `Vue3` 中的响应式原理

`Vue3`使用了`Proxy`的方式来做数据劫持。`Proxy`是`ES6`中的新特性，在之前的[【JS设计模式】代理模式](https://yx1aoq1.github.io/2020/08/19/JS设计模式/[JS设计模式]代理模式/)中做过介绍，这里就不再赘述。

对比`Object.defineProperty`与`Proxy`：

```js
const obj = {
  propKey: ''
}

const objProxy = new Proxy(obj, {
  get (target, propKey, receiver) {
    console.log('get', propKey)
    return propKey in target ? target[propKey] : undefined
  },
  set (target, propKey, value, receiver) {
    console.log('set', propKey, '=', value)
    target[propKey] = value
    return true
  },
})

objProxy.propKey = 'propKey'
// 输出：set propKey = propKey
objProxy.propKey
// 输出：get propKey
// 设置原本obj上不存在的属性，同样可以执行getter与setter
objProxy.newPropKey = 'newPropKey'
// 输出：set newPropKey = newPropKey
objProxy.newPropKey
// 输出：get newPropKey
// 对于再深一级的设值，无法触发getter与setter，只能读到deepPropKey这层
objProxy.deepPropKey = {}
// 输出：set deepPropKey = {}
objProxy.deepPropKey.a = 'a'
// 输出：get deepPropKey
```

```js
const ary = [0]
const aryProxy = new Proxy(ary, {
  get (target, propKey, receiver) {
    console.log('get', propKey)
    return propKey in target ? target[propKey] : undefined
  },
  set (target, propKey, value, receiver) {
    console.log('set', propKey, '=', value)
    target[propKey] = value
    return true
  },

})

aryProxy[0] = 1
// 输出：set 0 = 1
// 直接设值下标值，即使原本不存在也会触发setter
aryProxy[1] = 2
// 输出：set 1 = 2
// 调用原型方法同样有触发setter
aryProxy.push(3)
// 输出：
// get push
// get length
// set 2 = 3
// set length = 3
```

`Proxy`如何监听深层级的`object`：

```js
class DeepProxy {
  constructor (target, handler) {
    this._preproxy = new WeakMap()
    this._handler = handler
    return this.deepProxy(target, [])
  }

  deepProxy (obj, path) {
    for (let key of Object.keys(obj)) {
      if (typeof obj[key] === 'object') {
        obj[key] = this.deepProxy(obj[key], [...path, key])
      }
    }
    let p = new Proxy(obj, this.makeHandler(path))
    this._preproxy.set(p, obj)
    return p
  }

  deleteProxy (obj, key) {
    if (this._preproxy.has(obj[key])) {
      obj[key] = this._preproxy.get(obj[key])
      this._preproxy.delete(obj[key])
    }
    for (let k of Object.keys(obj[key])) {
      if (typeof obj[key][k] === 'object') {
        this.deleteProxy(obj[key], k)
      }
    }
  }

  makeHandler (path) {
    return {
      set: (target, key, value, receiver) => {
        if (typeof value === 'object') {
          value = this.deepProxy(value, [...path, key])
        }
        target[key] = value
        if (this._handler.set) {
          this._handler.set(target, [...path, key], value, receiver)
        }
        return true
      },
      get: (target, key, value, receiver) => {
        if (!Reflect.has(target, key)) {
          target[key] = this.deepProxy({}, [...path, key])
        }
        if (this._handler.get) {
          this._handler.get(target, [...path, key], value, receiver)
        }
        return target[key]
      },
      deleteProperty: (target, key) => {
        if (Reflect.has(target, key)) {
          this.deleteProxy(target, key)
          const deleted = Reflect.deleteProperty(target, key)
          if (deleted && this._handler.deleteProperty) {
            this._handler.deleteProperty(target, [...path, key])
          }
          return deleted
        }
        return false
      }
    }
  }
}
```

```js
let deep = new DeepProxy({}, {
  set (target, path, value, receiver) {
    console.log('set', path.join('.'), '=', value)
  },

  get (target, path, value, receiver) {
    console.log('get', path.join('.'), '=', value)
  },

  deleteProperty(target, path) {
    console.log('delete', path.join('.'))
  }
})

deep.a.c = 1
console.log(deep)
delete deep.a
console.log(deep)
/*
输出：
get a = { a: {} }
set a.c = 1
{ a: { c: 1 } }
delete a
{}
*/
```

相关源代码地址：[Yx1aoq1/mvvm](https://github.com/Yx1aoq1/mvvm)

