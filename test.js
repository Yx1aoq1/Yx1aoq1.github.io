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