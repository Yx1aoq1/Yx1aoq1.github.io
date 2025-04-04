---
title: Hexo之如何在线编辑博客
author: Yx1aoq1
tags:
  - hexo
categories:
  - 知识碎片
date: 2020-01-09 01:58:00
---
在搭了Hexo博客之后一直有一个很蛋疼的问题，就是不能像简书或者WordPress之类的有在线编辑的平台，虽然之前在github上备份了一份配置，但是每次都逃不开换个电脑就得重新`git clone`的命运。

于是乎，我找到了一个插件来解决这个问题——[Hexo Admin](https://github.com/jaredly/hexo-admin)

## Hexo Admin

这个插件就是可以在运行`hexo server`的时候，可以在`localhost:4000/admin`访问到一个文章管理系统。

![](https://github.com/jaredly/hexo-admin/blob/master/docs/pasted-0.png?raw=true)

根据官方文档，可以在hexo的配置文件`_config.yml`中配置登录的用户名密码：
```yml
admin:
  username: myfavoritename # 用户名
  password_hash: be121740bf988b2225a313fa1f107ca1 # bcrypt 加密后的密码
  secret: a secret something # cookies
```

如此就可以满足一个后台系统的全部需求。

## 部署线上

想要线上访问，首先，就得有一台服务器。在服务器上安装上完整环境：

* [安装nodejs](http://liaolongdong.com/2018/11/01/alicloud-node-mongodb.html)
* [安装git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

然后就是hexo的一套基本操作：

* `git clone ${hexo项目}`
* `npm install`
* `npm install hexo -g`
* `hexo server`

一顿操作，我们就可通过访问`${你的服务器ip}:4000/admin`来访问到后台了。但是此时就有个问题了，如果我断开和服务器的连接或者要做其他操作，那么此时启动的服务就会断开。那么，有什么办法能让`hexo server`一直开启着吗？

## PM2与Nginx代理

### PM2

PM2是node进程管理工具，可以利用它来简化很多node应用管理的繁琐任务，如性能监控、自动重启、负载均衡等，而且使用非常简单。

我们需要在项目的根目录创建一个app.js文件：

```app.js
const { exec } = require('child_process')
exec('hexo server -s',(error, stdout, stderr) => {
  if (error){
    console.log('exec error: ${error}')
    return
  }
  console.log('stdout: ${stdout}');
  console.log('stderr: ${stderr}');
})
```
运行`pm2 start app.js`，我们就可以启动一个nodejs进程，来开启hexo服务，并且持续运行。

### Nginx代理

因为一个服务器上总会开着N多个端口不一样的项目，为了通过子域名的形式来区分，所以使用了Nginx代理。只需要配置一下`nginx.conf`：

```
http {
  server {
    listen 80;
    server_name hexo.y4shero.com;
    location / {
      proxy_pass http://localhost:4000;
    }
  }
}
```

## 一键发布

Hexo Admin提供了Deploy的接口，通过配置`deployCommand`来执行发布脚本：

```yml
admin:
  deployCommand: './admin_script/hexo-deploy.sh'
```

脚本的内容也挺简单的，就是hexo发布的日常操作，以及再发布后，将更新同步到github：

```shell
#!/usr/bin/env sh
hexo g
hexo d
git pull
git add --all
git commit -m "update post"
git push origin hexo
```

至此，hexo的后台就完全搭建好了，很自动，很方便。

## 问题

在编辑博客的时候，发现post文件更新一定程度之后会导致服务断开502，导致编辑数据丢失，原因是因为之前启动的指令是`hexo server -d`，会监听source文件的变动导致重新部署，使得连接中断需要重新登录。所以将app.js中的启动指令改为了`hexo server -s`，启动静态模式，只会监听public文件夹的变化。

但是这依然会有一个问题：就是会导致有博文更新之后Hexo Admin的预览会出错。所以在一键发布的脚本里增加了`pm2 restart hexo`，在每次部署完后重启服务。