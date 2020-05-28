---
title: 搭建Hexo博客之后
categories:
  - 知识碎片
tags:
  - hexo
date: 2017-07-15 14:59:00
---
这几天在公司实习，用着公司的电脑，划水的时候想着更新一下博客，然后问题来了：博客的相关文件都在自家电脑没拷来，莫不是要重新搭一个环境？？那我部署之后岂不是之前的都被覆盖了？？？
然后突然觉得这丫的好像换电脑更新有点小问题呀就开始百度解决。
恩，然后找到了方法，然而感觉讲的太！不！清！楚！
折腾了半天，终于弄好了，以下整理了一下步骤：

## 使用分支方法解决hexo博客无法在两台电脑上更新的问题

### 创建本地仓库

首先，创建一个新的文件夹，和github上的仓库同名：`username.github.io`
然后开始创建本地仓库，以下是创建一个新的本地仓库的git指令
```git
$ touch README.md
$ git init 
$ git add README.md
$ git commit -m "first commit"
$ git remote add origin 你的项目地址
$ git push -u origin master
```
在执行push指令的时候可能会报错，让你先pull，这里可以执行以下命令解决
```git
$ git pull --rebase origin master
$ git push -u origin master
```
这样就可以将本地仓库里的文件更新到github仓库啦~\(≧▽≦)/~

### 创建hexo分支

```git
$ git branch hexo
$ git push origin hexo
```
这样这个博客仓库中就多了一条分支，我们就准备将hexo一些必要文件传在这个分支中，这样换电脑的时候就可以直接克隆这个项目的文件，麻麻再也不用担心我换电脑或者把博客数据搞丢了~~

### 在hexo分支中安装hexo

```git
$ git checkout hexo
$ npm install hexo
$ hexo init
$ npm install
```
这样我们就在hexo分支中安装好了hexo，然后你就会发现这个文件夹不是本地仓库了（不懂为什么hexo有这种设定），于是我们需要安装一个插件让hexo支持可以上传到github上
原文中提供的安装方法好像不管用，重新找了个名字叫[hexo-git-backup](https://github.com/coneycode/hexo-git-backup)
安装指令：
```git
$ npm install hexo-git-backup --save
```

### 配置_config.yml文件

打开_config.yml文件，拉到最下，我们需要改动一些东西
```yml
deploy:
	type: git #部署类型，使用github
	repository: #你的项目地址
	branch: master #部署分支，必须是master
	message: update #默认类型

#我们还需要添加那个插件的功能
backup:
	type: git
	repository:
		github: 项目地址,hexo #将这个本地仓库更新到hexo分支
```
然后我们在执行一下指令
```git
$ hexo g 
$ hexo d //部署博客
$ hexo b //将hexo文件中的更改提交到hexo分支
```
然后，事情就完美的解决啦~~

### 更换电脑后的操作

* 使用`git clone`将远程仓库克隆到本地
* 在本地的仓库执行`npm install hexo`、`npm install`、`npm install hexo-git-backup --save`，就完成了更换电脑更新的操作啦（记得，不需要`hexo init`这条指令）。

