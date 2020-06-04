---
title: Ajax, Axios, Fetch
categories:
  - Web基础
tags:
  - HTTP
  - Ajax
  - Axios
  - Fetch
date: 2020-06-03 14:03:07
---

## 浏览器中的HTTP请求方式

* 在地址栏输入URL
* window.location.href = ‘http://www.google.com'
* Form表单（GET/POST)

以上操作都会让浏览器向服务器发出HTTP请求，这些请求通常会触发浏览器的刷新和跳转。

## AJAX

AJAX是“Asynchronous JavaScript And XML”的缩写，是JS中异步发出HTTP请求的方式，实现了无刷新的请求。其中我们最熟悉的便是Jquery ajax，它的主要原理就是基于原生XHR的封装。

```js
$.ajax({
	type: 'POST',
  url: url,
  data: data,
  dataType: dataType,
  success: function () {},
  error: function () {}
})
```

```js
// ajax 的简单封装
function sendAjax (opt) {
  let xhr = new XMLHttpRequest()
  xhr.open(opt.type, opt.url)
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = xhr.response
      opt.success(data)
    } else {
      opt.error()
    }
  }
  xhr.send()
}
```

对于嵌套请求，AJAX有个难以回避的问题，就是“回调地狱”。随着JS语言的发展，我们有了回避“回调地狱”的解决方法——Promise。

## Axios

```js
axios.get('http://link.com')
	.then(res => {
  	// success
	})
	.catch(error => {
  	// error
	})
```

Axios是基于Promise的HTTP 库，可以用在浏览器和 node.js 中。特色：

* 从浏览器中创建 [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
* 从 node.js 创建 [http](http://nodejs.org/api/http.html) 请求
* 支持 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
* 拦截请求和响应
* 转换请求数据和响应数据
* 取消请求
* 自动转换 JSON 数据
* 客户端支持防御 [XSRF](http://en.wikipedia.org/wiki/Cross-site_request_forgery)

```js
// 基于Promise，对XMLHttpRequest进行封装
function sendAjax (opt) {
  let xhr = new XMLHttpRequest()
  return new Promise ((resolve, reject) => {
    xhr.open(opt.type, opt.url)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const data = xhr.response
        resolve(data)
      } else {
        reject()
      }
    }
    xhr.send()
  })
}
```

## Fetch

```js
fetch('http://link.com')
	.then(res => {
  	// success
	})
	.catch(error => {
  	// error
	})
```

[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 提供了一个 JavaScript 接口，用于访问和操纵 HTTP 管道的一些具体部分，例如请求和响应。它还提供了一个全局 [`fetch()`](https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalFetch/fetch) 方法，该方法提供了一种简单，合理的方式来跨网络异步获取资源。

Fetch是基于Promise设计的，并且脱离了XHR，是一种更理想的替代方法。

当然，在使用上，还是存在一些缺陷的，例如：

* 只对网络请求报错，对400，500都当做成功的请求，需要封装去处理
* 默认不会带cookie，需要添加配置项
* 不支持abort，不支持超时控制，使用setTimeout及Promise.reject的实现的超时控制并不能阻止请求过程继续在后台运行，造成了流量的浪费
* 没有办法原生监测请求的进度，而XHR可以

Fetch参考资料：

[传统 Ajax 已死，Fetch 永生](https://github.com/camsong/blog/issues/2)

[fetch没有你想象的那么美](http://undefinedblog.com/window-fetch-is-not-as-good-as-you-imagined/?utm_source=caibaojian.com)

[fetch使用的常见问题及解决方法](https://www.cnblogs.com/huilixieqi/p/6494380.html)

