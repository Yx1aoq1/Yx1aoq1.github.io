## 发布-订阅模式

发布-订阅模式的定义：

> 又名观察者模式，定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

### 举个例子——小明买房

小明看上了一套房子，但是到了售楼处之后才被告知已售罄。小明把电话留给了售楼处，等新楼盘推出之后，售楼处就立马通知小明。

```js
// 实现一个通用的发布-订阅功能
const event = {
  clientList: {},
  listen: function (key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    this.clientList[key].push(fn)
  },
  trigger: function () {
    const key = Array.prototype.shift.call(arguments),
          fns = this.clientList[key]
    if (!fns || fns.length === 0) {
      return false
    }
    for (let i = 0, fn; fn = fns[ i++ ];) {
      fn.apply(this, arguments)
    }
  }
}
```

```js
const salesOffices = {}
installEvent(salesOffices)

salesOffices.listen('squareMeter88', fn1 = (price) => { // 小明订阅88平方米房子的消息
  console.log('价格 = ' + price)
})

salesOffices.trigger('squareMeter88', 2000000) // 输出：2000000
```

**▼改进——增加取消发布**

```js
const event = {
  clientList: {},
  listen: function (key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    this.clientList[key].push(fn)
  },
  trigger: function () {
    const key = Array.prototype.shift.call(arguments),
          fns = this.clientList[key]
    if (!fns || fns.length === 0) {
      return false
    }
    for (let i = 0, fn; fn = fns[ i++ ];) {
      fn.apply(this, arguments)
    }
  },
  remove: function (key, fn) {
    const fns = this.clientList[key]
    if (!fns) {
      return false
    }
    if (!fn) {
      fns && (fns.length === 0)
    } else {
      for (let l = fns.length - 1; l >=0; l --) {
        const _fn = fns[l]
        if (_fn === fn) {
          fns.splice(l, 1)
        }
      }
    }
  }
}
```

```js
salesOffices.remove('squareMeter88', fn1)
salesOffices.trigger('squareMeter88', 200000) // 无输出
```

以上方案的缺点：

* 资源浪费，需要对每个发布者都添加`listen`、`trigger`方法，以及一个缓存列表`clientList`。（对每个对象执行`installEvent`）
* 订阅者和发布者存在一定的耦合，小明需要知道售楼处对象的名字是`salesOffices`才能顺利的订阅到事件。

**▼改进——使用全局发布-订阅对象**

```js
const Event = (function () {
  const clientList = {}
  
  const listen = function (key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    this.clientList[key].push(fn)
  }
  
  const trigger = function () {
    const key = Array.prototype.shift.call(arguments),
          fns = this.clientList[key]
    if (!fns || fns.length === 0) {
      return false
    }
    for (let i = 0, fn; fn = fns[ i++ ];) {
      fn.apply(this, arguments)
    }
  }
  
  const remove = function (key, fn) {
    const fns = this.clientList[key]
    if (!fns) {
      return false
    }
    if (!fn) {
      fns && (fns.length === 0)
    } else {
      for (let l = fns.length - 1; l >=0; l --) {
        const _fn = fns[l]
        if (_fn === fn) {
          fns.splice(l, 1)
        }
      }
    }
  }
  
  return {
    clientList,
    listen,
    trigger,
    remove
  }
})()
```

```js
Event.listen('squareMeter88', (price) => { // 小明订阅88平方米房子的消息
  console.log('价格 = ' + price)
})
Event.trigger('squareMeter88', 2000000) // 输出：2000000
```

**▼改进——支持先发布后订阅**

类似与QQ中的离线消息一样，离线消息被保存再服务器中，接收人下次登录上线之后，可以重新收到这条消息。

```js
const Event = (function () {
  const clientList = {}
  const cache = {} // 增加一个缓存消息栈
  
  const listen = function (key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    this.clientList[key].push(fn)
    
    const args = this.cache[key]
    if (args && args.length) { // 说明存在缓存消息，立即执行
      for (let i = 0, arg; arg = args[ i++ ];) {
        fn.apply(this, args)
      }
    }
  }
  
  const trigger = function () {
    const key = Array.prototype.shift.call(arguments),
          fns = this.clientList[key]
    if (!fns || fns.length === 0) {
      // 缓存参数
      if (!this.cache[key]) {
        this.cache[key] = []
      }
      this.cache[key].push(...arguments)
      return false
    }
    for (let i = 0, fn; fn = fns[ i++ ];) {
      fn.apply(this, arguments)
    }
  }
  
  const remove = function (key, fn) {
    const fns = this.clientList[key]
    if (!fns) {
      return false
    }
    if (!fn) {
      fns && (fns.length === 0)
    } else {
      for (let l = fns.length - 1; l >=0; l --) {
        const _fn = fns[l]
        if (_fn === fn) {
          fns.splice(l, 1)
        }
      }
    }
  }
  
  return {
    clientList,
    cache,
    listen,
    trigger,
    remove
  }
})()
```

```js
Event.trigger('message', 'hello')
Event.listen('message', (msg) => {
  console.log('收到消息：' + msg)
}) // 收到消息：hello
```

**▼改进——解决命名冲突问题**

由于全局的发布-订阅对象只有一个`clientList`来存放消息名和回调函数，难免会出现事件命名冲突的问题，所有需要给`Event`增加创建命名空间的功能。

```js
const Event = (function () {
  const global = this
  let _default = 'default' // 默认命名空间

  const Event = (function () {
    const _slice = Array.prototype.slice
    const _shift = Array.prototype.shift
    const _unshift = Array.prototype.unshift
    let find
    let namespaceCache = {}

    const each = function (arr, fn) {
      let ret
      for (let i = 0, l = arr.length; i < l; i ++) {
        const n = arr[i]
        ret = fn.call(n, i, n)
      }
      return ret
    }

    const _listen = function (key, fn, cache) {
      if (!cache[key]) {
        cache[key] = []
      }
      cache[key].push(fn)
    }

    const _remove = function (key, cache, fn) {
      const fns = cache[key]
      if (!fns) {
        return false
      }
      if (!fn) {
        cache[key] = []
      } else {
        for (let l = fns.length - 1; l >= 0 ; l--) {
          const _fn = fns[l]
          if (_fn === fn) {
            fns.splice(l, 1)
          }
        }
      }
    }

    const _trigger = function () {
      const cache = _shift.call(arguments)
      const key = _shift.call(arguments)
      const stack = cache[key]
      const args = arguments
      const _self = this

      if (!stack || stack.length === 0) {
        return false
      }
      // 遍历缓存列表
      return each(stack, function () {
        return this.apply(_self, args)
      })
    }

    const _create = function (namespace) {
      namespace = namespace || _default
      let cache = {}
      let offlineStack = []
      const ret = {
        listen: function (key, fn, last) {
          _listen(key, fn, cache)
          if (offlineStack === null) { // 没有离线事件就返回
            return
          }
          if (last === 'last') { // 只执行最新的离线事件
            offlineStack.length && offlineStack.pop()()
          } else { // 执行全部离线事件
            each(offlineStack, function () {
              this()
            })
          }
          offlineStack = null // 离线事件只执行一次
        },
        one: function (key, fn, last) {
          _remove(key, cache)
          this.listen(key, fn, last)
        },
        remove: function (key, fn) {
          _remove(key, cache, fn)
        },
        trigger: function () {
          const _self = this
          _unshift.call(arguments, cache)
          let args = arguments
          let fn = function () {
            return _trigger.apply(_self, args)
          }

          // 缓存离线事件
          if (offlineStack) {
            return offlineStack.push(fn)
          }
          return fn()
        }
      }

      return namespace
        ? (namespaceCache[namespace] ? namespaceCache[namespace] : namespaceCache[namespace] = ret)
        : ret
    }

    return {
      create: _create,
      one: function (key, fn, last) {
        const event = this.create()
        event.one(key, fn, last)
      },
      remove: function (key, fn) {
        const event = this.create()
        event.remove(key, fn)
      },
      listen: function (key, fn, last) {
        const event = this.create()
        event.listen(key, fn, last)
      },
      trigger: function () {
        const event = this.create()
        event.trigger.apply(this, arguments)
      }
    }
  })()

  return Event
})()
```

```js
// 先发布后订阅
Event.trigger('click', 1 )
Event.listen('click', (a) => {
  console.log(a) // 输出：1
})

// 使用命名空间
Event.create('namespace1').listen('click', (a) => {
  console.log(a) // 输出：1
})
Event.create('namespace1').trigger('click', 1 )

Event.create('namespace2').listen('click', (a) => {
  console.log(a) // 输出：1
})
Event.create('namespace2').trigger('click', 2)
```

## 发布-订阅模式的应用

## 总结

* 优点：
  * 时间上的解耦
  * 空间上的解耦
* 缺点：
  * 消耗一定的时间和内存
  * 对象与对象间的必要联系被深埋再背后，不利于程序跟踪维护和理解