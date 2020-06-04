---
title: 关于HTTP请求小记
date: 2017-03-20 15:31:38
categories: 
  - Web基础
tags: 
  - HTTP
  - 网络
---
* **HTTP：** 是计算机通过网络进行通信的规则
* **步骤：**
	* 建立TCP连接
	* Web浏览器向Web服务器发送请求命令
	* Web浏览器发送请求头信息
	* Web服务器应答
	* Web服务器发送应答头信息
	* Web服务器向浏览器发送数据
	* Web服务器关闭TCP连接

* **组成：**
	* HTTP请求的方法或动作，比如是GET还是POST请求
	* 正在请求的URL
	* 请求头，包含一些客户端环境信息，身份验证信息等
	* 请求体（请求正文），包含客户提交的查询字符串信息，表单信息等等
```http
GET /login.php HTTP/1.1 //请求地址

//请求头
Host:localhost
Connection:keep-alive
Accept:text/javascript,application/javascript,application/ecmascript,
application/x-ecmascript,*/*;
q=0.01
X-Requested-With:XMLHttpRequest
User-Agent:Mozilla/5.0(Windows NT 6.1)Referer:http//www.baidu.com/
Accept-Encoding:gzip,deflate,sdch
Accept-Language:zh-CN,zh;q=0.8,en;q=0.6

//请求体
username=admin&password=123456
```
* **GET：** 一般用于信息获取，使用URL传递参数，对所发送信息的数量也有限制，一般在2000个字符。（一般用于查询，不做修改，数据是安全的）
* **POST：** 一般用于修改服务器上的资源。对所发送信息的数量无限制。
* **GET和POST的区别：**
	* GET方式需要使用`Request.QueryString`来取得变量的值，而POST方式通过`Request.Form`来获取变量的值，也就是说Get是通过地址栏来传值，而Post是通过提交表单来传值。
	* 然而，在以下情况中，请使用 **POST 请求**：
	无法使用缓存文件（更新服务器上的文件或数据库）
	向服务器发送大量数据（POST 没有数据量限制）
    发送包含未知字符的用户输入时，POST 比 GET 更稳定也更可靠
* **HTTP响应组成：**
	* 一个**数字**和**文字**组成的状态码，用来显示请求是成功还是失败的
	* 响应头，包含服务器信息，如服务器类型、日期时间、内容类型和长度等
	* 响应体（响应正文），服务器传来的字符串或html代码等
```http
HTTP/1.1 200 OK
Date:Sun,23 Nov 2014 10:14:45 GMT
Server:Apache
Content-Encoding:gzip
Content-Length:7112
Connection:Keep-Alive
Content-Type:application/javascript
```
* **HTTP状态码：** 由3位数字构成，其中首位数字定义了状态码的类型
	* 1XX：信息类，表示收到Web浏览器请求，正在进一步处理中
	* 2XX：成功，表示用户请求被正确接受，理解和处理，例如：200 OK
	* 3XX：重定向，表示请求没有成功，客户必须采取进一步的动作
	* 4XX：客户端错误，表示客户端提交的请求有错误，例如：404 NOT Found
	* 5XX：服务器错误，表示服务器不能完成对请求的处理，例如：500


* **HTTP状态码（具体）：**

	* **100  Continue**  继续，一般在发送post请求时，已发送了http header之后服务端将返回此信息，表示确认，之后发送具体参数信息
	* **200  OK**   正常返回信息
	* **201  Created**  请求成功并且服务器创建了新的资源
	* **202  Accepted**  服务器已接受请求，但尚未处理
	* **301  Moved Permanently**  请求的网页已永久移动到新位置
	* **302  Found**  临时性重定向
	* **303  See Other**  临时性重定向，且总是使用 GET 请求新的 URI
	* **304  Not Modified**  自从上次请求后，请求的网页未修改过
	* **400  Bad Request**  服务器无法理解请求的格式，客户端不应当尝试再次使用相同的内容发起请求
	* **401  Unauthorized**  请求未授权
	* **403  Forbidden**  禁止访问
	* **404  Not Found**  找不到如何与 URI 相匹配的资源
	* **500  Internal Server Error**  最常见的服务器端错误
	* **503  Service Unavailable** 服务器端暂时无法处理请求（可能是过载或维护）
