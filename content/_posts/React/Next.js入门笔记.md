---
title: Next.js入门笔记
categories:
  - React
tags:
  - nextjs
date: 2025-03-18 20:42:45
---

## 什么是 Next.js

Next.js 是一个基于 React 的开源框架，用于构建快速、现代化的 Web 应用程序。主要用于构建高性能的服务器端渲染（SSR）和静态生成（Static Generation）的现代 Web 应用。

### 主要功能

#### 路由

Next.js 提供了一个基于文件系统的路由，可以让我们快速创建页面路由。以官方的初始化项目为例，在 `/app`目录下的`page.tsx`文件就是初始根路由所展示的页面，当你需要一个`/about`路由下的页面时，也仅需要在`/app`目录下创建一个`/about`文件夹，然后创建一个`page.tsx`即可。

![屏幕截图 2025-03-18 210158](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-03-18%20210158.png?imageSlim)

![屏幕截图 2025-03-18 210305](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-03-18%20210305.png?imageSlim)

同时，可以创建 layout.tsx，来创建嵌套布局。

##### 路由组

当你想要给你的路由分组管理，但是又不想多一层的文件夹体现在 URL 路径上时，可以通过将文件夹名称括在括号中来创建路由组：`(folderName)`

##### 动态路由

可以通过将文件夹名称括在方括号中来创建动态段：`[folderName]`。

动态段作为 `params` 属性传递给 [`layout`](https://next.nodejs.cn/docs/app/api-reference/file-conventions/layout)、[`page`](https://next.nodejs.cn/docs/app/api-reference/file-conventions/page)、[`route`](https://next.nodejs.cn/docs/app/building-your-application/routing/route-handlers) 和 [`generateMetadata`](https://next.nodejs.cn/docs/app/api-reference/functions/generate-metadata#generatemetadata-function) 函数。

```tsx
export default function Posts({ params }) {
  return (
    <>
      <h1>POST: {params.id}</h1>
    </>
  )
}
```

![屏幕截图 2025-03-18 211501](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-03-18%20211501.png?imageSlim)

##### 并行路由

并行路由是使用命名槽创建的。插槽是按照 `@folder` 约定定义的。

![屏幕截图 2025-03-18 213057](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-03-18%20213057.png?imageSlim)

##### 拦截路由

拦截路由可以使用 `(..)` 约定来定义：

- `(.)` 匹配同一级别的段
- `(..)` 匹配上一级的段
- `(..)(..)` 匹配上面两级的段
- `(...)` 匹配根 `app` 目录中的段

一般用来创建模态内容。

##### 路由的跳转

官方推荐使用`<Link>`组件来做路由的跳转。它拓展自`<a>`标签，所以例如`target="_blank"`的属性也可以使用，以及它也提供了其他 API 配置。如`replace`，是否替换当前历史状态。

```tsx
import Link from 'next/link'

export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
```

##### 中间件

中间件允许你在请求完成之前运行代码。然后，根据传入的请求，你可以通过重写、重定向、修改请求或响应标头或直接响应来修改响应。它的使用场景有：

- 身份验证和授权：在授予对特定页面或 API 路由的访问权限之前，请确保用户身份并检查会话 cookie。
- 服务器端重定向：根据某些条件（例如区域设置、用户角色）在服务器级别重定向用户。
- 路径重写：通过根据请求属性动态重写 API 路由或页面的路径，支持 A/B 测试、功能推出或旧版路径。
- 机器人检测：通过检测和阻止机器人流量来保护你的资源。
- 日志记录和分析：在由页面或 API 处理之前，捕获并分析请求数据以获取见解。
- 功能标记：动态启用或禁用功能以实现无缝功能部署或测试。

#### 元数据

可以从从 `layout.tsx`或静态 `page.tsx` 文件导出 [`Metadata` 对象](https://next.nodejs.cn/docs/app/api-reference/functions/generate-metadata#metadata-object)。用于对路由页面进行描述简介，增强 SEO。

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '...',
  description: '...'
}

export default function Page() {}
```

#### 使用客户端渲染

当我们需要创建有用户交互的页面时，需要使用`'use client'`指令，将其添加到文件顶部，这样才能正常的使用 react 中的`useState`等客户端渲染功能。

```
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

### 国际化方案

`next-intl` 是一个专为 Next.js 框架设计的国际化(i18n)解决方案，旨在提供一种简单易用且功能强大的方式来管理你的应用多语言支持。

#### App Router 方式

使用下面这样的文件夹结构：

```
├── messages # 翻译文件
│   ├── en.json
│   └── ...
├── next.config.ts # 插件配置
└── src
    ├── i18n
    │   ├── routing.ts # 自定义路由配置
    │   ├── navigation.ts # 导航跳转的功能与组件导出
    │   └── request.ts # 加载语言包的配置
    ├── middleware.ts
    └── app
        └── [locale]
            ├── layout.tsx
            └── page.tsx
```

```ts
// i18n/routing.ts

import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // 所有支持的语言环境的列表
  locales: ['en', 'de'],

  // 当没有匹配的语言环境时使用
  defaultLocale: 'en'
})
```

```ts
// i18n/request.ts

import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// 围绕 Next.js 导航 API 的轻量级封装，
// 这些封装会考虑路由配置
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
```

```ts
// i18n/navigation.ts

import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // 通常对应于 `[locale]` 段
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
```

```ts
// src/middleware.ts

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 匹配所有路径名，除了
  // - 以 `/api`、`/trpc`、`/_next` 或 `/_vercel` 开头的路径名
  // - 包含点号的路径名（例如 `favicon.ico`）
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}
```
