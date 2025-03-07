---
title: 服务端渲染（SSR）
categories:
  - 知识碎片
tags:
  - SSR
date: 2025-03-07 18:06:25
---

### 服务端渲染的定义

在讲什么是服务端渲染之前，我们需要回顾一下普通的页面渲染流程是怎样的：

1. 浏览器通过请求得到了一个 HTML 文件
2. 渲染进程解析 HTML 文件，构建 DOM 树
3. 解析 HTML 的同时，如果遇到内联样式或者样式脚本，则下载并构建样式规则（stytle rules），若遇到 JavaScript 脚本，则会下载执行脚本
4. DOM 树和样式规则构建完成之后，渲染进程将两者合并成渲染树（render tree）
5. 渲染进程开始对渲染树进行布局，生成布局树（layout tree）
6. 渲染进程对布局树进行绘制，生成绘制记录
7. 渲染进程的对布局树进行分层，分别栅格化每一层，并得到合成帧
8. 渲染进程将合成帧信息发送给 GPU 进程显示到页面中

![image-20200730191954015](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200730191954015.png?imageSlim)

这个交由浏览器去解析 HTML 文本，以及执行 JavaScript 脚本去更改 DOM 结构的过程，就叫动态渲染，也可以叫客户端渲染（client side render）。

那么什么是服务端渲染（server side render）？顾名思义，服务端渲染就是在浏览器请求页面 URL 的时候，服务端将我们需要的 HTML 文本组装好，并返回给浏览器，这个 HTML 文本被浏览器解析之后，不需要经过 JavaScript 脚本的执行，即可直接构建出希望的 DOM 树并展示到页面中。这个服务端组装 HTML 的过程，叫做服务端渲染。

![image-20200731165404271](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200731165404271.png?imageSlim)

### 服务端渲染的发展

#### Web1.0

在 Web1.0 时代，几乎所有应用都是服务端渲染（此时服务器渲染非现在的服务器渲染），那个时候的页面渲染大概是这样的，浏览器请求页面 URL，然后服务器接收到请求之后，到数据库查询数据，将数据丢到后端的组件模板（php、asp、jsp 等）中，并渲染成 HTML 片段，接着服务器在组装这些 HTML 片段，组成一个完整的 HTML，最后返回给浏览器，这个时候，浏览器已经拿到了一个完整的被服务器动态组装出来的 HTML 文本，然后将 HTML 渲染到页面中，过程没有任何 JavaScript 代码的参与。

![image-20200731115513579](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200731115513579.png?imageSlim)

#### 客户端渲染

随着 Web 技术的发展和业务的不断壮大，Web1.0 的弊端也逐渐显现：

- 每次更新页面的一小的模块，都需要重新请求一次页面，重新查一次数据库，重新组装一次 HTML
- 前端 JavaScript 代码和后端（jsp、php、jsp）代码混杂在一起，使得日益复杂的 WEB 应用难以维护

于是，伴随着 node.js 的出现，前辈们开启了一场前后端分离的运动。前后端分离之后，网页开始被当成了独立的应用程序（SPA，Single Page Application），前端团队接管了所有页面渲染的事，后端团队只负责提供所有数据查询与处理的 API，于是交互流程就变成了：浏览器请求 URL，前端服务器返回一个空的静态 HTML 文件（不需要任何查数据库和模板组装），这个 HTML 文件中加载了很多渲染页面需要的 JavaScript 脚本和 CSS 样式表，浏览器拿到 HTML 文件后开始加载脚本和样式表，并且执行脚本，这个时候脚本请求后端服务提供的 API，获取数据，获取完成后将数据通过 JavaScript 脚本动态的将数据渲染到页面中，完成页面显示。

![image-20200731142605631](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200731142605631.png?imageSlim)

#### 服务端渲染

随着单页应用（SPA）的发展，客户端渲染的弊端也渐渐暴露出来了。首先是 SEO（Search Engine Optimazition，即搜索引擎优化）的不友好，以及随着应用的复杂化，JavaScript 脚本也不断的臃肿起来，首屏渲染的体验也差了很多。

那么如何解决这些问题呢？于是目光又回到了服务端渲染上，但是这个渲染工作主要是交由 Node.js 服务器来做的。大体流程与客户端渲染有些相似，首先是浏览器请求 URL，前端服务器接收到 URL 请求之后，根据不同的 URL，前端服务器向后端服务器请求数据，请求完成后，前端服务器会组装一个携带了具体数据的 HTML 文本，并且返回给浏览器，浏览器得到 HTML 之后开始渲染页面，同时，浏览器加载并执行 JavaScript 脚本，给页面上的元素绑定事件，让页面变得可交互，当用户与浏览器页面进行交互，如跳转到下一个页面时，浏览器会执行 JavaScript 脚本，向后端服务器请求数据，获取完数据之后再次执行 JavaScript 代码动态渲染页面。

![image-20200731172929911](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200731172929911.png?imageSlim)

### 服务端渲染的利弊

#### 优点

- **利于 SEO**：由于服务端渲染返回的是带有具体内容的 HTML 文本，而不是一个 HTML 空壳，有利于搜索引擎检索到相关信息。

- **白屏时间短**：由于服务端渲染返回的已经是一个带有完整内容的 HTML，所以直接构建 DOM 树即可。不像客户端渲染，需要在经过加载 JavaScript 脚本、请求服务端数据、重新渲染数据等等的步骤。如此就大大提升了白屏时间。

#### 缺点

- **代码复杂度增加**：为了实现服务端渲染，应用代码中需要兼容服务端和客户端两种运行情况，而一部分依赖的外部扩展库却只能在客户端运行，需要对其进行特殊处理，才能在服务器渲染应用程序中运行。
- **需要更多的服务器负载均衡**：由于服务器增加了渲染 HTML 的需求，使得原本只需要输出静态资源文件的 Node.js 服务，新增了数据获取的 IO 和渲染 HTML 的 CPU 占用，如果流量突然暴增，有可能导致服务器 down 机，因此需要使用响应的缓存策略和准备相应的服务器负载。
- **涉及构建设置和部署的更多要求**：与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同，服务器渲染应用程序，需要处于 Node.js server 运行环境。

### 如何实现一个 SSR

在服务端渲染中，有两种页面渲染的方式：

- 前端服务器通过请求后端服务器获取数据并组装 HTML 返回给浏览器，浏览器直接解析 HTML 后渲染页面
- 浏览器在交互过程中，请求新的数据并动态更新渲染页面

因此我们需要在服务端渲染中处理，让同一份代码既可以在服务端执行，也可以在客户端执行，也就是“**同构**”。

那么我们应该如何去实现一个“**同构**”的项目呢？

#### 代码结构

```
src
├── router
├────── index.js # 路由声明
├── store
├────── index.js # 全局状态
├── main.js # ⽤于创建vue实例
├── entry-client.js # 客户端⼊⼝，⽤于静态内容“激活”
└── entry-server.js # 服务端⼊⼝，⽤于⾸屏内容渲染
```

首先是入口文件`main.js`，对于之前的客户端渲染模式，由于每个用户都是在自己的浏览器中运行实例，创建新的上下文，所以每个用户都互不干扰，因此我们在客户端渲染模式下的`vue`入口文件是这样的：

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
```

但是到了服务端渲染模式，因为 Node.js 服务器运行的是一个长期进程，如果每个用户向服务器请求的是同一个实例，用户间共享上下文，就很容易导致交叉请求状态污染。因此，我们需要的是一个可以重复执行的工厂函数，再分别对客户端渲染、服务端渲染配置不同构建。

```js
// main.js
import { createSSRApp } from 'vue'
import { initRouter } from './router'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const router = initRouter()

  app.use(router)

  return {
    app,
    router
  }
}
```

其次，我们需要一个服务端的入口，它的主要职责就是根据当前的`url`创建对应的实例，最后返回对应的结果。

```js
import { createApp } from './main'

export default async (context) => {
  try {
    const { app, router } = createApp()

    router.push(context.req.url)

    await router.isReady()

    const matchedComponents = router.currentRoute.value.matched.map((record) => Object.values(record.components)).flat()

    if (!matchedComponents.length) {
      throw { code: 404 }
    }

    return app
  } catch (err) {
    throw err
  }
}
```

最后，我们还需要一个客户端渲染的入口，用来做客户端“激活”。什么是客户端激活呢？引用官方的话就是：

> 所谓客户端激活，指的是 Vue 在浏览器端接管由服务端发送的静态 HTML，使其变为由 Vue 管理的动态 DOM 的过程。

由于服务器已经渲染好了 HTML，**客户端要做的是“激活”这些静态的 HTML，使他们成为动态的、能够响应后续的数据变化的**。激活的方式也很简单，就是把`main.js`中，创建实例过程后没有做的一步`mount`执行一下就行了。

```js
import { createApp } from './main'

const { app, store } = createApp()

router.isReady().then(() => {
  app.mount('#app')
})
```

当然，我们需要根据不同的环境，对对应的入口文件进行一定的编译，还要起一个node服务等等，这些操作就不多说了。其实已经有很多的框架为我们做好了很多的操作，让我们可以更快的启动一个SSR的项目。

* Vue生态：[Nuxt](https://nuxt.com/)
* React生态：[Nextjs](https://www.nextjs.cn/)
*  [vite-plugin-ssr](https://vite-plugin-ssr.com/)
