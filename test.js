class Folder {
  constructor (name) {
    this.name = name
    this.parent = null
    this.files = []
  }
  
  add (file) {
    file.parent = this // 设置父对象引用
    this.files.push(file)
  }
  
  scan () {
    console.log(`开始扫描文件夹：${this.name}`)
    this.files.forEach(file => {
      file.scan()
    })
  }
  
  remove () {
    if (!this.parent) return
    const files = this.parent.files
    files.forEach((file, index) => {
      if (file === this) {
        files.splice(index, 1)
      }
    })
  }
}

class File {
  constructor (name) {
    this.name = name
    this.parent = null
  }
  
  add (file) {
    throw new Error('文件下不能再添加文件')
  }
  
  scan () {
    console.log(`开始扫描文件：${this.name}`)
  }
  
  remove () {
    if (!this.parent) return
    const files = this.parent.files
    files.forEach((file, index) => {
      if (file === this) {
        files.splice(index, 1)
      }
    })
  }
}

let folder = new Folder('学习资料')
let folder1 = new Folder('JavaScript')
let folder2 = new Folder('JQuery')

let file1 = new File('JavaScript设计模式与开发实践')
let file2 = new File('精通JQuery')
let file3 = new File('重构与模式')

folder1.add(file1)
folder2.add(file2)

folder.add(folder1)
folder.add(folder2)
folder.add(file3)

folder.scan()

file1.remove()

folder.scan()