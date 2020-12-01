---
title: Vue响应式原理（02）
categories:
  - Vue
tags:
  - Vue
date: 2020-11-14 14:10:11
---

在上一篇中，大概说明了`Vue 2.x`的响应式原理，其中主要是实现了对`Object`类型的数据的监听。但是仍有一些情况的数据变化无法监听到，这里就需要提一下`Object.defineProperty`存在的一些缺陷问题了。

## 存在的缺陷

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

### set & delete 的实现

对于`Object`属性的添加与删除，以及`Array`类型通过下标赋值的问题，提供而外的触发函数`set`与`delete`，下面附上实现方式：

```js
export function set (target, key, val) {
  // 判断target是否是Array类型以及key下标是否合法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    // 在key的位置插入新值
    target.splice(key, 1, value)
    return val
  }
  // 判断target是否是Object类型，以及key是否是新属性
  if (key in target && !(key in Object.prototype)) {
    // 对于非新属性的key，因为已经做过处理，可以直接替换值并return新值
    target[key] = val
    return val
  }
  // 判断target是否是响应对象
  const ob = target.__ob__
  if (!ob) {
    // 不是响应对象，不需要进行数据劫持，直接设值并返回
    target[key] = val
    return val
  }
  // 是响应对象的数据，要对新的key注册新的数据劫持
  defineReactive(ob.value, key, val)
  // 通知更新
  ob.dep.notify()
  return val
}
```

```js
export function del (target, key) {
  // 判断target是否是Array类型以及key下标是否合法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 删除key位置的数据
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  // 判断key属性是否有在target上定义，没有定义可以直接啥也不操作
  if (!hasOwn(target, key)) {
    return
  }
  // 删除属性key
  delete target[key]
  // 判断target是否是响应对象，只有是响应对象的数据才触发通知更新
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

### 数组原型方法拦截器

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

## Vue3中的响应式原理

`Proxy`是`ES6`中的新特性，在之前的[【JS设计模式】代理模式](https://yx1aoq1.github.io/2020/08/19/JS设计模式/[JS设计模式]代理模式/)中做过介绍，这里就不再赘述。由于浏览器对`Proxy`的支持并不是很完善，为了兼容性的考虑`Vue2.x`版本选择了`Object.defineProperty`来实现数据劫持。而新推出的`Vue3`已经改用`Proxy`对原来的数据劫持方法进行了重构。

### Proxy的优势

对比`Object.defineProperty`与`Proxy`：

* `Object.defineProperty` 拦截的是对象的属性，会改变原对象。`Proxy` 是拦截整个对象，通过`new`生成一个新对象，不会改变原对象
* `Proxy` 的拦截方式，除了`get`和`set`，还有 11 种，可以监听一些 `Object.defineProperty` 监听不到的操作，比如监听数组，监听对象属性的新增，删除等

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

### DeepProxy的实现

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