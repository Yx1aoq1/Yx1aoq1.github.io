---
title: cli工具之init
date: 2019-10-19 16:11:11
categories: 
  - node相关
tags:
  - node
  - fet源码
  - cli工具
---
了解了命令行工具开发的基本操作后，继续来逐一解析各个指令的实现方式。首先从最简单的init下手。

`init`命令通常都具备以下几个功能：

* 可交互
* 远程拉取项目到本地
* 可修改package.json中的项目名版本号等信息

那么，如何实现呢？

## inquirer

[inquirer](https://github.com/SBoudrias/Inquirer.js/#examples)是nodejs的交互式命令行工具，通过该插件我们可以完成终端上的交互。

### 使用方法

```js
inquirer
  .prompt([
    {
      type: 'input', // 交互方式，input、confirm等
      name: 'projectName', // 用来存输入结果的字段名
      message: 'project name:', // 提示输入信息
      default: 'template' // 默认值
    }
  ])
  .then((answers) => {
    console.log(answers)
  })
```
你将看到的交互效果：
![](https://my-image-1300309047.cos.ap-chengdu.myqcloud.com/my_blog/cmd-4.png)

## download-git-repo

[download-git-repo](https://www.npmjs.com/package/download-git-repo)是将远程仓库（如GitHub, GitLab, Bitbucket）的项目下载到本地的命令行工具。

### 使用方法

```js
// 从github下载
download(repositoryName, projectName, function (err) {
  console.log(err ? 'Error' : 'Success')
})
```

## 修改package.json

这里我们使用nodejs的fs模块所提供的方法来实现，代码如下：

```js
function edit (info, path) {
  fs.readFile(path + '/package.json', function (err, data) {
    if (err) {
      console.log(err)
      return
    }
    var data = JSON.parse(data)
    data.name = info.projectName
    data.author = info.author
    data.version = info.version
    var replaceData = JSON.stringify(data, null, 4)
    fs.writeFile(path + '/package.json', replaceData, function (err) {
      if (err) {
        console.log(err)
      }
    })
  })
}
```

## 完整代码

```js
var program = require('commander')
var ora = require('ora') //ora 一个命令行loading效果
var inquirer = require('inquirer') // 命令行交互
var download = require('download-git-repo') // github api用来下载github的模板
var fs = require('fs')

program
  .command('init [projectName]') // 设置指令
  .description('init project')
  .action(function (projectName, opts) { // 执行操作
    var loading = ora('fetching template......')
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '项目名称',
          default: projectName || 'template'
        },
        {
          type: 'input',
          name: 'author',
          message: '作者'
        },
        {
          type: 'input',
          name: 'version',
          message: '版本',
          default: '0.1.0'
        }
      ])
      .then(function (answers) {
        var repository = 'Yx1aoq1/vue-template'
        var project = answers.projectName
        loading.start()
        download(repository, project, function (err) {
          if (err) {
            console.log(err)
            return
          }
          var path = process.cwd() + '\/' + project
          edit(answers, path)
          console.log(path)
          loading.succeed()
        })
      })
  })

function edit (info, path) {
  fs.readFile(path + '/package.json', function (err, data) {
    if (err) {
      console.log(err)
      return
    }
    var data = JSON.parse(data)
    data.name = info.projectName
    data.author = info.author
    data.version = info.version
    var replaceData = JSON.stringify(data, null, 4)
    fs.writeFile(path + '/package.json', replaceData, function (err) {
      if (err) {
        console.log(err)
      }
    })
  })
}
```

