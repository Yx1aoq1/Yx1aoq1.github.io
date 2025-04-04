---
title: Cookie技术
categories:
  - 网络技术
tags:
  - Cookie
  - 跨域
  - CORS
date: 2020-11-10 16:28:33
---

## Cookie技术

> Cookie，指某些网站为了辨别用户身份而存储在用户本地终端（Client Side）上的数据。

### Cookie的作用

**Cookie的作用是通过在请求和响应报文中写入Cookie信息来控制客户端的状态。**

一个**典型的应用场景**就是，当用户登录一个网站时，网站往往会请求用户输入用户名和密码，并且用户可以勾选“下次自动登录”。如果勾选了，那么下次访问同一网站时，用户会发现不需要再次输入用户名和密码就可以直接登录浏览了。这正是因为前一次登录时，服务器发送了包含登录凭证的Cookie到用户的硬盘上，第二次登录时，如果该Cookie尚未到期，浏览器就会在请求时携带该Cookie，服务器验证凭证，就不需要再让用户输入用户名和密码了。

### Cookie 的缺陷

* Cookie会被附加在每个HTTP请求中，所以无形中增加了流量
* 由于在HTTP请求中的Cookie是明文传输的，所以存在安全性问题，除非使用HTTPS
* Cookie的大小限制在4KB左右，对于复杂的存储需求来说是不够用的

### Cookie的使用

假设浏览器发送第一个请求，请求`www.example.org`站点的首页：

```
GET /index.html HTTP/1.1
Host: www.example.org
```

服务端以两个`Set-Cookie`头响应：

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: theme=light
Set-Cookie: sessionToken=abc123; Expires=Wed, 09 Jun 2021 10:18:14 GMT
```

第一个"theme"，由于没有设置`Expires`或`Max-Age`属性，会被当成一个`Session cookie`，当浏览器关闭时，这个Cookie也会被删除。

第二个“sessionToken”，则是一个持久性的Cookie，因为它包含了`Expires`属性，这个属性会让浏览器在指定时间内删除Cookie。

接下去浏览器发送另一个请求访问`spec.html`页面，这个请求头中会包含一个`Cookie`属性，里面有服务器设置的两个Cookie值。

```
GET /spec.html HTTP/1.1
Host: www.example.org
Cookie: theme=light; sessionToken=abc123
...
```

通过这种方式服务端知道这个请求和上个页面有关。服务端会返回请求页面，可能会在响应中包含更多的`Set-Cookie`头来增加Cookie，或者修改删除Cookie。

#### 在`express`框架下使用Cookie

```js
import Express from 'express'
import cookieParser from 'cookie-parser'

const app = Express()
// 使用cookie-parser中间件
app.use(cookieParser())

app.use('/', (req, res, next) => {
  // 校验在cookie中的token身份信息
  if (checkToken(req.cookies.token)) {
    next()
  } else {
    // 身份校验失败，给客户端返回重新登录的状态码
    responseClient(res, 401, '身份信息已过期，请重新登录')
    return
  }
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  // 确认用户的用户名密码是否正确
  if (checkUser(username, password)) {
    // 确认用户名密码无错误之后生成对应的token并设置Cookie
    res.cookie('token', generateToken(username, password) ,{ expires: new Date(Date.now() + 100), httpOnly: true })
    responseClient(res, 200, '登录成功')
  } else {
    responseClient(res, 500, '用户名/密码错误')
  }
})

app.listen(8080)
```

### Cookie的属性

#### `Domin`&`Path`

用来限定Cookie的范围，告诉浏览器Cookie属于哪个站点。为了安全，Cookie只能在当前资源的顶级域名或子域名上设置。

```
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
```

#### `Expires`

定义了一个指定的日期和时间，到了这个日期或时间时，浏览器应该删掉Cookie。日期和时间的指定格式是`Wdy, DD Mon YYYY HH:MM:SS GMT`或者`Wdy, DD Mon YY HH:MM:SS GMT`。

```
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
```

#### `Max-Age`

用来设置Cookie的有效期，以相对于浏览器接收到Cookie之后的秒数来计算。

```
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
```

#### `Secure`

指示浏览器只能通过安全/加密连接使用Cookie。意味着只有在HTTPS请求时才会携带这个Cookie，当请求是HTTP时不会带上这个Cookie。不过设置`Secure`的Cookie对与客户端脚本来说是可读可写的，所以依然有被盗取篡改的风险。

```
Set-Cookie: <cookie-name>=<cookie-value>; Secure
```

#### `HttpOnly`

指示浏览器除了HTTP/HTTPS请求之外不要显示Cookie。这种Cookie不能在客户端通过脚本获取（例如JavaScirpt，引用document.cookie）。

```
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
```

#### `SameSite`

防止CSRF（Cross-Site Request Forgery，跨站请求伪造攻击）的设定。由于Cookie经常用来验证登录状态，当你成功登录A网站时，A网站会设置Cookie来存储你的用户信息，以方便于一定时间内的免登录。而在此期间如果你访问了一些恶意网站，这个恶意网站向A网站发送请求，浏览器会默认携带之前的Cookie，如果A网站没有再做token校验，就会将恶意网站发送的请求误认为是用户操作，从而产生漏洞，这就是CSRF攻击。

* `Samesite=Strict`：严格模式，表明这个 Cookie 在任何情况下都不可能作为第三方 Cookie，绝无例外。
* `Samesite=Lax`：宽松模式，比 Strict 放宽了点限制，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。

### 第三方Cookie

* **第一方Cookie**：指的是由网络用户访问的域创建的Cookie。大多数浏览器都支持第一方Cookie。
* **第三方Cookie**：指的是建立在别的域名，而不是你访问的域名（地址栏中的网址）而创建的Cookie。

#### 如何跨域设置Cookie

由于浏览器存在同源策略，会导致Cookie在请求不同域的时候并不会自动携带。

为了实现跨域，服务端需要添加请求头：

```
Access-Control-Allow-Origin: a.com // 发起请求的域名，设置允许跨域请求
Access-Control-Allow-Credentials: true
```

而客户端在发送请求时，必须添加请求配置：

```
xhr.withCredentials = true
```

当`a.com`请求`b.com`时，浏览器会自动携带上`b.com`可以访问的所有Cookie（会受到domain配置的影响）

#### 第三方Cookie的应用

* **访客统计工具**：比如有一个网站`blog.com`，每当用户打开`blog.com`中的页面时，就会发送一个GET请求到`helper.com`。这样只要分析`helper.com`的日志，就可以了解`blog.com`的访问情况。这类工具会在Cookie中存放用户的ID，每个浏览器得到的ID都是不同的，用户访问时检查Cookie中的ID，ID相同的访问被认为来自同一个用户，否则是不同的用户。
* **广告**：你访问过的网站会写入一些第三方Cookie在你的浏览器里，这些Cookie会被一些广告公司用来售卖更精准的广告。比如你曾上过一家汽车网站，通过第三方Cookie就可以记录下你“曾经浏览某某汽车品牌”的这一信息，从而对你精准地投放广告。

#### 浏览器支持

* IE：默认不接受第三方 Cookie，不过采用 P3P 协议即可（理论上讲，服务商应该在协议里真实地反映网站的信息搜集行为，若声明的隐私政策与实际行为不符，是要负法律责任的）。
* Chrome、Firefox：默认接受。但用户可以在设置中设置不接受。
* Safari：默认会阻止第三方cookie。

## Cookie 与 Session 的关系

* Session 是在服务端保存的一个数据结构，用来跟踪用户的状态，这个数据可以保存在集群、数据库、文件中
* Cookie 是客户端保存用户信息的一种机制，用来记录用户的一些信息，也是实现Session的一种方式