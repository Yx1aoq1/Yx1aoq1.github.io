## Electron介绍

### 从Chromium讲起

由于Electron内置了Chromium，所以也有一个多进程架构的特点，所以来做一下简单的介绍。

在我们使用Chrome浏览器的时候就会发现，在大部分情况下一个页面崩溃并不会引起整个应用程序的崩溃，这是因为Chromium将每个页面都约束在单独的进程中，以保护整个浏览器不受单个页面中的故障影响。它甚至还限制了每个页面进程对其他进程和系统其他部分的访问，这样做带来的优点就是大大缓解了应用崩溃的问题。

Chromium把管理页面、管理选项卡和插件的进程成为`Browser`进程。把特定于页面的进程称为`Renderer`进程。

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/electron0.jpg)

如图例，一个 `Renderer`进程就相当于一个标签页（也存在其他情况，例如使用`window.open`打开新窗口，就会共享同一个 `Renderer `；如果页面存在多个不同域下的`iframe`，则会分成多个`Renderer`进程），而`RenderProcess`与`RenderProcessHost`则是负责使用IPC(Inter Process Communication)来处理主进程与渲染进程之间的通信。当页面脚本尝试访问网络或本地资源时， `Renderer`进程就会发消息给`Browser`进程，由`Browser`来判断操作是否合法，以此处理或者拒绝服务。

多进程模式还带来了性能上的提升，对于那些不可见的进程，操作系统会再用户可用内存较低时，把它们占用内存的部分或全部交换到磁盘上，以保证用户可见的进程更具响应性。

但多进程模式并不是没有确定，比如每个进程都会包含公共基础结构的副本（例如V8引擎的执行环境）、更复杂的通信模型等，这都意味着浏览器会消耗更多的内存、CPU甚至电能（这也是为什么Electron应用资源消耗较大的底层原因）。

### Electron 架构

<img src="https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/electron1.jpg" style="zoom: 33%;" />

Electron 架构和 Chromium 架构类似，也是具有1个主进程和多个渲染进程。但是也有区别

* 在各个进程中暴露了 `Native API (Main Native API、Renderer Native API)`
* 引入 Node.js

具体Electron是如何将Chromium与Node.js整合在一起的可以参考以下地址：

https://www.electronjs.org/blog/electron-internals-node-integration

https://github.com/electron/electron/blob/master/shell/common/node_bindings.cc

## 实践开发



### 进程通信

### 窗口管理

### electron-builder



### electron-updater

### 编译与调试

## 其他

### 源码混淆



### 应用签名

### 静默安装与开机自启

### 自定义安装画面

### 软件防杀



参考文章

* [[“Electron” 一个可圈可点的 PC 多端融合方案](https://segmentfault.com/a/1190000022543101)](https://segmentfault.com/a/1190000022543101)
