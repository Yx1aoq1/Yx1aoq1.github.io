let myObj = {
  [Symbol.iterator]: function () {
    let index = 0
    return {
      next: function () {
        index ++
        return {
          value: index,
          done: index >= 10
        }
      }
    }
  }
}
// for...of遍历
for (let i of myObj) {
  console.log(i)
}

// 也可以直接获取这个迭代器进行遍历
let it = myObj[Symbol.iterator]()
for (let i = it.next(); i.done !== true; i = it.next()){
  console.log(i.value)
}