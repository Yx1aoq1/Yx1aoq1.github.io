## Electron简要介绍

![img](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/160e4902add3ca8d)

### 图解

Electron由Node.js + Chromium + Native APIs构成。你可以理解为，它是一个得到了Node.js和基于不同平台的Native APIs加强的Chromium浏览器，可以用来开发跨平台的桌面级应用。

它的开发主要涉及到两个进程的协作——Main（主）进程和Renderer（渲染）进程：

* Main（主）进程通过Node.js、Chromium和Native APIs来**实现一些系统以及底层的操作**，比如创建系统级别的菜单、操作剪贴板、创建APP的窗口等。
* Renderer（渲染）进程主要通过Chromium来**实现APP的图形界面**——就是我们熟悉的前端开发的部分，不过得到了Electron给予的加强，一些Node的模块（比如fs）和一些在Main进程里能用的东西（比如Clipboard）也能在Render进程里使用。
* Main（主）进程和Renderer（渲染）进程通过`ipcMain`和`ipcRenderer`来进行通信。通过事件监听和事件派发来实现两个进程的通信，从而实现Main或者Renderer进程里不能实现的某些功能。

## Electron-vue实践

### 项目初始化

在[electron-vue](https://legacy.gitbook.com/book/simulatedgreg/electron-vue)的文档中有介绍通过`vue-cli`脚手架创建项目模板，考虑到`vue-cli`已经升级至`4.x`版本，所以没有使用用脚手架模板的方式创建项目，而是引入了[vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)。

使用`vue-cli`创建一个新的项目：

```
vue create hello-world
```

接着在项目文件夹内安装插件`electron-builder`：

```
vue add electron-builder
```

执行完成之后你会发现项目文件产生了一些变化：

![image-20201029140554207](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20201029140554207.png)

之后执行`yarn run electron:serve`就可以启动项目：

![image-20201029143146380](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20201029143146380.png)

### 主进程开发



文章参考：

* [Electron-vue开发实战0——Electron-vue入门](https://juejin.cn/post/6844903549617307661)
* 