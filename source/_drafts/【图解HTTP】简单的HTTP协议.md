## 简单的HTTP协议

注：讲解的版本为HTTP/1.1版本

### HTTP协议概念

HTTP是建立在TCP协议基础上的传输协议，它定义了客户端如何向服务端发送请求，以及服务端如何响应客户端的请求。

* 在应用HTTP协议时，必定是一端担任客户端角色，另一端担任服务端角色
* HTTP协议中规定，通信必须是由客户端发起建立的，服务端在没有接收到请求之前不会发送响应

![image-20200908205022605](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908205022605.png)

### HTTP请求报文结构

请求报文是由请求方法、请求URI、协议版本、可选的请求首部字段和内容实体构成的。

![image-20200908205115404](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908205115404.png)

### HTTP响应报文结构

响应报文基本上由协议版本、状态码（表示请求成功或失败的数字代码）、用以解释状态码的原因短语、可选的响应首部字段以及实体主体构成。

![image-20200908205716735](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908205716735.png)

### HTTP方法

#### GET：获取资源

GET方法用来请求访问已被URI识别的资源，指定的资源经服务器端解析后返回响应内容。

如果请求的资源是文本（如HTML文本、图片、视频等），那就保持原样返回；如果是像CGI（Common Gateway Interface，通用网关接口）那样的程序，则返回经过执行后的输出结果。

![image-20200908213006796](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908213006796.png)

#### POST：传输实体主体

POST方法用来传输实体的主体。

虽然用GET方法也可以传输实体的主体，但一般不用GET方法进行传输。虽说POST的功能与GET很相似，但POST的主要目的并不是获取响应的主体内容。

在实际应用中我们也可以发现通常“请求列表数据”这种动作的接口通常是用GET方法，而“提交表单”这种动作的接口则是用POST方法。

![image-20200908213216363](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908213216363.png)

关于GET和POST的区别：

* **GET 和 POST 方法没有实质区别**，只是报文格式不同。报文格式上，不带参数时，最大区别就是第一行方法名不同。带参数时，它们的区别是，GET方法的参数放在 URL 中，POST方法参数应该放在 Body 中。
* 按照网上大部分文章的解释，POST 比 GET 安全，因为数据在地址栏上不可见。然而，**从传输的角度来说，他们都是不安全的**，因为 HTTP 在网络上是明文传输的，只要在网络节点上捉包，就能完整地获取数据报文。要想安全传输，就只有加密，也就是 HTTPS。
* GET方法的长度限制的主要原因是**浏览器和服务端对URL的长度限制导致的**，而实际上HTTP协议中并没有对Body和URL的长度限制。

#### PUT：传输文件

PUT方法用来传输文件。就像FTP协议的文件上传一样，要求在请求报文的主体中包含文件内容，然后保存到请求URI指定的位置。

但是，鉴于HTTP/1.1的PUT方法自身不带验证机制，任何人都可以上传文件，存在安全性问题，因此一般的Web网站不使用该方法。若配合Web应用程序的验证机制，或架构设计采用REST（REpresentational State Transfer，表征状态转移）标准的同类Web网状，就可能会开放使用PUT方法。

![image-20200908220001446](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908220001446.png)

解释一下**REST标准**：

* REST描述的是在网络中client和server的一种交互形式
* REST的实际应用就是**如何设计RESTful API（REST风格的网络接口）**
* RESTful API的目的是可以通过一套统一的接口为Web，IOS和Android提供服务
* [RESTful API 最佳实践](https://www.ruanyifeng.com/blog/2018/10/restful-api-best-practices.html)

#### HEAD：获得报文首部

HEAD方法和GET方法一样，只是不返回报文主体部分。用于确认URI的有效性及资源更新的日期实际等。

![image-20200908221030246](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908221030246.png)

#### DELETE：删除文件

DELETE方法用来删除文件，是与PUT相反的方法。DELETE方法按请求URI删除指定的资源。

但是，HTTP/1.1的DELETE方法本身和PUT方法一样不带验证机制，所以一般的Web网站也不使用DELETE方法。当配合Web应用程序的验证机制，或遵守REST标准时还是有可能会开放使用的。

![image-20200908221558289](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908221558289.png)

#### OPTIONS：询问支持的方法

OPTIONS方法用来查询针对请求 URI 指定的资源支持的方法。

请求：

```
OPTIONS * HTTP/1.1
(* 表示不访问特定资源，而是向服务器本身发起请求)
```

响应：

```
HTTP/1.1 200 OK
Allow: GET,POST,HEAD,OPTIONS
(返回服务器支持的方法)
```

AJAX进行跨域请求时，浏览器会发送一个OPTIONS请求（CORS预检请求），从而获知服务端是否允许该跨域请求。

![image-20200908222511704](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908222511704.png)

#### TRACE：追踪路径

TRACE 方法是让 Web 服务器端将之前的请求通信环回给客户端的方法。根据协议，服务器在收到TRACE请求后，应回显所收到的数据，即服务器返回自己所收到的数据。客户端通过TRACE方法可以查询发送出去的请求是怎样被加工修改篡改的。

但是，TRACE方法本来就不怎么常用，再加上它容易引发XST（Cross-Site Tracing，跨站追踪）攻击，通常就更不会用到了。

![image-20200908225530534](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908225530534.png)

#### CONNECT：要求用隧道协议连接代理

CONNECT方法要求在与代理服务器通信时建立隧道，实现用隧道协议进行TCP通信。主要使用SSL（Secure Sockets Layer，安全套接层）和TLS（Transport Layer Security，传输层安全）协议把通信内容加密后经网络隧道传输。

CONNECT方法的格式：

```
CONNECT 代理服务器名:端口号 HTTP版本
```

![image-20200908230208604](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200908230208604.png)

### HTTP的特点

#### 无状态

HTTP 是一种不保存状态，即无状态（stateless）协议。使用HTTP协议时，每当有新的请求发送时，就会有对应的新的响应产生。协议本身并不保留之前一切的请求或响应报文的信息。

* 优点：能更快地处理大量地事务，确保协议的可伸缩性；减少服务器的CPU及内存资源的消耗。
* 缺点：随着Web地不断发展，许多业务需要保存用户的状态（例如登录）。解决方案就是引入**Cookie技术**。

#### 持久连接

在HTTP协议的初始版本中，每进行一次HTTP通信就要断开一次TCP连接。但随着HTTP的普及，文档中包含大量图片的 情况多了起来，如果每次的请求都断开重连，会增加通信量的开销。因此在HTTP/1.1和一部分的HTTP/1.0想出了持久连接（HTTP Persistent Connections，也称为 HTTP keep-alive 或 HTTP connection reuse）的方法。持久连接的特点是，只要任意一端没有明确提出断开连接，则保持TCP连接状态。**在 HTTP/1.1 中，所有的连接默认都是持久连接**。

![image-20200909201148466](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200909201148466.png)

**持久连接的作用：**

* 减少了 TCP 连接的重复建立和断开所造成的额外开销，减轻了服务器端的负载。
* 减少开销的那部分时间，使 HTTP 请求和响应能够更早地结束，Web页面的响应速度也会变快。

**如何关闭连接：**

* 如果服务端`Response Header`设置了`keep-alive: timeout={timeout}`，客户端会在保持连接的`timeout`（单位秒）时间后关闭连接。（一般服务端软件，如Nginx，Tomcat都会有相关的配置）。
* 在请求头或响应头中配置`Connection: close`，表明客户端或服务器想要关闭该网络连接。

#### 管线化

管线化是指，在发送请求后，无需等待响应即可直接发送下一个请求，它的实现依赖于持久连接。管线化有利于提高网页的加载速度，同时也可以减少TCP/IP的数据包大小。

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

