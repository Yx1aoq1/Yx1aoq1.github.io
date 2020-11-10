### Cookie技术

#### Cookie的作用

通过在请求和响应报文中写入Cookie信息来控制客户端的状态。

![image-20200909211959782](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200909211959782.png)

#### Cookie的使用

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

#### Cookie的属性

* `Domin`和`Path`：用来限定Cookie的范围，告诉浏览器Cookie属于哪个站点。为了安全，Cookie只能在当前资源的顶级域名或子域名上设置。

```
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
```

* `Expires`：定义了一个指定的日期和时间，到了这个日期或时间时，浏览器应该删掉Cookie。日期和时间的指定格式是`Wdy, DD Mon YYYY HH:MM:SS GMT`或者`Wdy, DD Mon YY HH:MM:SS GMT`。

```
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
```

* `Max-Age`：用来设置Cookie的有效期，以相对于浏览器接收到Cookie之后的秒数来计算。

```
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
```

* `Secure`：指示浏览器只能通过安全/加密连接使用Cookie。意味着只有在HTTPS请求时才会携带这个Cookie，当请求是HTTP时不会带上这个Cookie。不过设置`Secure`的Cookie对与客户端脚本来说是可读可写的，所以依然有被盗取篡改的风险。

```
Set-Cookie: <cookie-name>=<cookie-value>; Secure
```

* `HttpOnly`：指示浏览器除了HTTP/HTTPS请求之外不要显示Cookie。这种Cookie不能在客户端通过脚本获取（例如JavaScirpt，引用document.cookie）。

```
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
```

* `SameSite`：防止CSRF（Cross-Site Request Forgery，跨站请求伪造攻击）的设定。由于Cookie经常用来验证登录状态，当你成功登录A网站时，A网站会设置Cookie来存储你的用户信息，以方便于一定时间内的免登录。而在此期间如果你访问了一些恶意网站，这个恶意网站向A网站发送请求，浏览器会默认携带之前的Cookie，如果A网站没有再做token校验，就会将恶意网站发送的请求误认为是用户操作，从而产生漏洞，这就是CSRF攻击。
  * `Samesite=Strict`：严格模式，表明这个 Cookie 在任何情况下都不可能作为第三方 Cookie，绝无例外。
  * `Samesite=Lax`：宽松模式，比 Strict 放宽了点限制，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。

#### 第三方Cookie

如果你是正常的正在逛天猫，天猫会把你的信息写入`Cookie`到`.tmall.com`这个域下，但是打开控制台你会发现，并不是说有的`Cookie`都是`.tmall.com`这个域下的，里面还有一些其他域的`Cookie`，这些非当前域下的`Cookie`都被称为第三方Cookie。这些第三方Cookie主要来自于网页上嵌入的广告或图片等来自第三方域的资源，当我们访问这些资源的时候，这个第三方域就会在当前域设置Cookie。

为什么需要第三方Cookie呢？再打开`taobao.com`，你会发现你已经不需要再登录了，因为淘宝、天猫都属于阿里旗下的产品，阿里为他们提供了统一的登录服务。在你登录天猫或者淘宝的时候，你的信息也会被存到这个统一登录的服务域下，所以存到这个域下的 `Cookie` 就成了第三方 `Cookie`。

平常我们在搜索引擎或者视频网站上搜索一些东西，然后打开购物网站就可以收到各种你兴趣的相关推荐，这已经是大众习以为常的事情了。各大购物网站、广告商，会通过第三方Cookie收集你的年龄、性别、浏览历史等从而判断你的兴趣喜欢，然后带给你精准的信息推荐。

![image-20200909223359600](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200909223359600.png)

![image-20200909223427072](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200909223427072.png)

目前，Safari浏览器已经完全禁用了第三方Cookie，Google Chrome官方团队前不久也宣布，为了提升用户隐私和安全，未来两年将完全禁用第三方Cookie。

