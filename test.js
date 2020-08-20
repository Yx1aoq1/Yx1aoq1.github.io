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