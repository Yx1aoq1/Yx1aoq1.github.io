---
title: 简单的HTTP协议
categories:
  - 网络技术
tags:
  - HTTP
date: 2020-11-10 14:03:12
---
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

文章参考：
《图解HTTP》