---
title: 【Web安全】CSRF
categories:
  - Web安全
tags:
  - CSRF
date: 2020-08-10 17:00:39
---
## CSRF

> CSRF（Cross-Site Request Forgery），中文名称：跨站请求伪造攻击。攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

### CSRF 原理

一个典型的CSRF攻击有着如下的流程：

* 受害者登录 `a.com`，并保留了登录凭证（Cookie）
* 攻击者引诱受害者访问了`b.com`
* `b.com`向`a.com`发送了一个请求：`a.com/act=xx`，浏览器会默认携带`a.com`的Cookie
* `a.com`接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求
* `a.com`以受害者的名义执行了 `act=xxx`
* 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让`a.com`执行了自己定义的操作

### 常见的攻击类型

#### GET 类型的 CSRF

```html
<img src="https://a.com/act?id=xxxx&flag=xxxx" />
```

在受害者访问含有这个`<img>`标签的页面后，浏览器会自动向`https://a.com/act?id=xxxx&flag=xxxx`发出一次 HTTP 请求，`a.com`就会收到包含受害者登录信息的一次跨域请求。

#### POST 类型的 CSRF

```html
<form action="https://a.com/act" method="post">
  <input type="hidden" name="id" value="123456" />
  <input type="hidden" name="flag" value="xxxx" />
</form>
<script>
	document.forms[0].submit()
</script>
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次 POST 操作。POST 类型的攻击通常比 GET 要求更加严格一点，但仍并不复杂。

#### 链接类型的 CSRF

```html
<a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
	重磅消息！！
</a>
```

由于之前用户登录了信任的网站A，并且保存登录状态，只要用户主动访问上面这个PHP页面，则表示攻击成功。

这种类型的 CSRF 并不常见，比起其他两种用户打开页面就中招的情况，这种需要用户点击链接才能触发。这种类型通常是在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招。

### CSRF 防护策略

**▼CSRF 特点**

* 攻击一般发起在第三方网站，而不是被攻击的网站，被攻击的网站无法防止攻击发生
* 攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作，而不是直接窃取数据
* 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用”
* 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪

#### 同源检测

由于 CSRF 大多来自于第三方网站，那么我们直接禁止外域（或者不受信任的域名）对我们发起请求，就能防止攻击。那么，我们如何判断请求是否来自于外域呢？

在 HTTP 协议中，每一个异步请求都会携带两个 Header，用于标记来源域名：

* Origin Header
* Referer Header

这两个 Header 在浏览器发起请求时，大多数情况会自动带上，并且不能由前端自定义内容。服务器可以通过解析这两个 Header 中的域名，来确定请求的来源域。

![image-20200630153409435](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200630153409435.png)

**▼使用Origin Header确定来源域名**

Origin Header 是用于 **CORS 请求 ** 或者 **POST 请求** 的参数，它指示了请求来源的域名，不包含路径信息：

Origin 会在以下两种情况下不存在：

* **IE 11同源策略**：IE 11 不会在 CORS 请求上添加 Origin 标头。最根本原因是因为 IE 11 对同源的定义和其他浏览器有不同，有两个主要的区别，可以参考[MDN Same-origin_policy#IE_Exceptions](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#IE_Exceptions)
* **302重定向**：在302重定向之后 Origin 不包含在重定向的请求中，因为 Origin 可能会被认为是其他来源的敏感信息。对于302重定向的情况来说都是定向到新的服务器上的URL，因此浏览器不想将 Origin 泄露到新的服务器上。

**▼使用Referer Header确定来源域名**

Referer Header 记录了 HTTP 请求的来源地址，并包含了路径信息。对于 Ajax 请求，图片等静态资源的请求，Referer 为发起请求的页面地址；对于页面跳转，Referer 为打开页面历史记录的前一个页面地址。

但也存在 Referer 不存在的情况：

* 来源页面采用的协议为表示本地文件的`file`或者`data:URI`
* 当前请求页面采用的是非安全协议，而来源页面采用的是安全协议（HTTPS）
* 直接输入网站或通过浏览器书签访问
* 使用 JavaScript 的 `location.href` 或者是 `location.replace()`
* 使用 HTML5 中的 `noreferrer`（Referrer Policy）

**▼无法确认来源域名情况**

当一个请求不存在 Origin 和 Referer 时，建议进行阻止。但也存在一个例外：当一个请求是页面请求时（例如网站的主页），而来源是搜索引擎的链接（例如百度的搜索结果），也会被当成疑似 CSRF 攻击，所以在判断的时候需要过滤掉页面请求的情况，通常 Header 符合以下条件：

```
Accept: text/html
Method: GET
```

但相应的，页面请求就暴露在了 CSRF 的攻击范围之中，如果网站中，页面的 GET 请求对当前用户做了什么操作的话，防范就失效了。

综上所述，同源验证是一个相对简单的防范方法，能够防范绝大多数的 CSRF 攻击，但也并不是万无一失的。对于安全性要求较高，或者有较多用户输入内容的网站，我们就要对关键的接口做额外的防护措施。

#### CSRF Token

CSRF 的另一个特点是，攻击者无法直接窃取到用户的信息（Cookie、Header、网站内容），仅仅是冒用 Cookie 中的信息，而 CSRF 攻击之所以能够成功，是因为服务器误把攻击者发送的请求当成了用户自己的请求。那么我们可以要求所有的用户请求都**携带一个 CSRF 攻击者无法获取的 Token** ，服务器通过校验请求是否携带正确的 Token，把正常的请求与攻击者的请求区分开，就可以有效的防范 CSRF 攻击。

CSRF Token 的防护策略分为三个步骤：

1. **将 CSRF Token 输出到页面中**

首先，用户打开页面时，服务器需要给这个用户生成一个 Token，该 Token 通过加密算法对数据进行加密，一般 Token 都包含随机字符串和时间戳的组合。显然，在提交时 Token 不能放入 Cookie 中，否则又会被攻击者冒用。因此，为了安全起见 Token 最好存在服务器的 Session 中。

2. **页面提交的请求携带这个 Token**

对于 GET 请求，Token 将附在请求地址之后，这样 URL 就会变成`http://a.com/act?token=xxxx`，而对于 POST 请求，则要在 form 的最后加上：

```html
<input type="hidden" name="csrf" value="{{csrfToken}}" />
```

这样，就把Token以参数的形式加入请求了。

3. **服务器验证 Token 是否正确**

当用户从客户端得到 Token，再次提交给服务器时，服务器则需要判断 Token 的有效性，验证过程是先解密 Token ，对比加密字符串以及时间戳，如果加密字符串一致且时间未过期，那么这个 Token 就是有效的。

在前后端分离的项目中，一般在登录操作后，由后端返回一个参数 `token` ，之后前端将 `token` 存在 `localStorage`中，在需要 Token 的 api 请求中取出使用。

#### 双重 Cookie 验证

利用 CSRF 攻击不能获取到用户 Cookie 的特点，我们可以要求请求参数中携带一个 Cookie 中的值。双重 Cookie 的流程如下：

* 在用户访问页面时，向请求域名注入一个 Cookie，内容为随机字符串（例如 `crsfcookie=v8g9e4ksfhw`）
* 在前端向后端发起请求时，取出 Cookie，并添加到 URL 的参数中（同 Token 的操作）
* 后端接口验证 Cookie 中的字段与 URL 参数中的字段是否一致

但此方法并没有大规模的应用，其在大型网站上的安全性还没有 CSRF Token 高。由于任何跨域都会导致前端无法获取 Cookie 中的字段（包括子域名之间），所有在应用中会发生如下的情况：

* 如果用户访问的网站为`a.com`，而后端的api域名为`api.a.com`，那么在`a.com`下，前端拿不到`api.a.com`的Cookie
* 于是这个认证 Cookie 必须被种在 `a.com`下，这样每个子域名都可以访问
* 任何一个子域名都可以修改`a.com`下的 Cookie
* 某个子域名存在漏洞被 XSS 攻击，虽然这个子域名下可能不存在什么值得窃取的信息，但攻击者可以修改`a.com`下的 Cookie
* 攻击者可以直接使用自己配置的 Cookie，对 XSS 中招的用户再向 `a.com` 发起 CSRF 攻击

总结如下：

**▼优点**

* 无需使用 Session，适用面更广，易于实施
* token 存储在客户端中，不会给服务端带来压力
* 相对于 CSRF Token，实施成本更低，可以在前后端统一拦截校验，而不需要一个个接口和页面添加

**▼缺点**

* Cookie 中增加了额外字段
* 如果有其他漏洞（如 XSS ），攻击者可以注入 Cookie，那么该防御方式失效
* 难以做到子域名的隔离
* 为了确保 Cookie 传输安全，采用这种防御方式最好确保网站使用 HTTPS 的方式

#### Samesite Cookie 属性

为了从源头上解决解决 CSRF 问题，Google 起草了一份草案来改进 HTTP 协议，就是为 Set-Cookie 响应头新增 Samesite 属性，它用来标明这个 Cookie 是个”同站Cookie“，同站 Cookie 只能作为第一方 Cookie，不能作为第三方 Cookie。

```js
import Express from 'express'

const app = Express()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === CONFIG.username && password === CONFIG.password) {
    req.session.username = username
    // 设置 samesite cookie
    res.cookie('crsftoken', 'tokenvalue', { sameSite: 'strict' })
    responseClient(res, 200, 'Success.', username)
  } else {
    responseClient(res, 500, 'Username or Password invalid.')
  }
})
```

* **Samesite=Strict**：严格模式，表明这个 Cookie 在任何情况下都不可能作为第三方 Cookie，绝无例外
* **Samesite=Lax**：宽松模式，比 Strict 放宽了点限制，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外

Samesite也同样不是完美的：

在SamesiteCookie被设置为Strict时，浏览器在任何跨域请求中都不会携带 Cookie，新标签重新打开也不携带，所以 CSRF 攻击基本没有机会，但是对于用户来说，在登陆后，从一个新标签打开或者访问子域名，都需要重新登录，体验并不友好。

而设置为Lax时，那么其他网站通过页面跳转过来的时候可以使用 Cookie，可以保障外域链接打开页面时用户的登录状态，但相应的安全性也会变低。

另一个方面是 Samesite 的兼容性问题，除了新版的 Chrome 和 Firefox 支持以外，Safari 以及 iOS Safari 都还不支持，现阶段暂时无法普及。

而且，SamesiteCookie 目前有一个致命的缺点：不支持子域名。总之，SamesiteCookie 是一个可能替代同源验证的方案，但目前还并不成熟，其应用场景有待观望。



参考链接：

* [常见 Web 安全攻防总结](https://zoumiaojiang.com/article/common-web-security/#csrf-2)

* [前端安全系列之二：如何防止CSRF攻击？](https://juejin.im/post/5bc009996fb9a05d0a055192#heading-24)