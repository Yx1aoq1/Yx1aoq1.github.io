title: Hexo之如何在线编辑博客
author: Yx1aoq1
tags:
  - hexo
categories:
  - 知识碎片
date: 2020-01-09 01:58:00
---
在搭了Hexo博客之后一直有一个很蛋疼的问题，就是不能像简书或者WordPress之类的有在线编辑的平台，虽然之前在github上备份了一份配置，但是每次都逃不开换个电脑就得重新`git clone`的命运。

<!--more-->

在搭了Hexo博客之后一直有一个很蛋疼的问题，就是不能像简书或者WordPress之类的有在线编辑的平台，虽然之前在github上备份了一份配置，但是每次都逃不开换个电脑就得重新`git clone`的命运。

于是乎，我找到了一个插件来解决这个问题——[Hexo Admin](https://github.com/jaredly/hexo-admin)

### Hexo Admin

这个插件就是可以在运行`hexo server`的时候，可以在`localhost:4000/admin`访问到一个文章管理系统。

![](https://github.com/jaredly/hexo-admin/blob/master/docs/pasted-0.png?raw=true)

根据官方文档，可以在hexo的配置文件`_config.yml`中配置登录的用户名密码：
```
admin:
  username: myfavoritename // 用户名
  password_hash: be121740bf988b2225a313fa1f107ca1 // bcrypt 加密后的密码
  secret: a secret something // cookies
```

如此就可以满足一个后台系统的全部需求。

### 部署线上

想要线上访问，首先，就得有一台服务器。在服务器上安装上完整环境：

* [安装nodejs](http://liaolongdong.com/2018/11/01/alicloud-node-mongodb.html)
* [安装git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

然后就是hexo的一套基本操作：

* `git clone ${hexo项目}`
* `npm install`
* `npm install hexo -g`
* `hexo server`

此时，我们就可通过访问`${你的服务器ip}:4000/admin`来访问到后台了。