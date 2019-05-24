---
title: AJAX学习笔记
date: 2017-03-21 16:21:19
categories: 知识碎片
tags: 
  - Ajax
---
> AJAX = Asynchronous JavaScript and XML（异步的 JavaScript 和 XML）
> AJAX 不是新的编程语言，而是一种使用现有标准的新方法。
> AJAX 是与服务器交换数据并更新部分网页的艺术，在不重新加载整个页面的情况下。
* 同步：发送方发出数据后，等接收方发回响应以后才发下一个数据包的通讯方式
* 异步：发送方发出数据后，不等接收方发回响应，接着发送下个数据包的通讯方式
（简单点说：同步就是只能一件一件事的来做，而异步就是可以多件事同时进行）

<!--more-->

> AJAX = Asynchronous JavaScript and XML（异步的 JavaScript 和 XML）
> AJAX 不是新的编程语言，而是一种使用现有标准的新方法。
> AJAX 是与服务器交换数据并更新部分网页的艺术，在不重新加载整个页面的情况下。
* 同步：发送方发出数据后，等接收方发回响应以后才发下一个数据包的通讯方式
* 异步：发送方发出数据后，不等接收方发回响应，接着发送下个数据包的通讯方式
（简单点说：同步就是只能一件一件事的来做，而异步就是可以多件事同时进行）

## 实现
* 实现页面
* 运用XMLHttpRequest和web服务器进行数据的异步交换
* 运用javascript操作DOM，实现动态局部刷新

## 创建ajax过程
* 创建XMLHttpRequest对象
* 创建一个新的HTTP请求，并指定该HTTP请求的方法、URL及验证信息
* 设置响应HTTP请求状态变化的函数
* 发送HTTP请求
* 获取异步调用返回的数据
* 使用Javascript和DOM实现局部刷新

## XHR
* 发送请求
	* `open(method,url,async)` 
method表示发送方法(GET,POST)，url表示请求地址（相对或绝对），async表示同步或异步（异步true，默认值，同步false）
	* `send(string)` 
GET请求参数可不填写或写none，用POST请求需要填写。
```javascript
var request = new XMLHttpRequest(); //创建XHR对象
request.open("GET","get.php",true);
request.send();

//创建信息
request.open("POST","post.php",true);
request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//头信息，提示服务器要发送一个表单
request.send("name=tom&sex=man");
```
* 响应请求
	* `responseText`：获得字符串形式的响应数据
	* `responseXML`：获得XML形式的响应数据（XML交互较少，一般采用json）
	* `status&statusText`：以数字和文本形式返回HTTP状态码
	* `getAllResponseHeader()`：获取所有的响应报头
	* `getResponseHeader()`：查询响应中的某个字段的值

* 监听服务器响应
**readyState属性：** 代表服务器响应的变化
	* 0：请求未初始化，open还没有调用
	* 1：服务器连接已经建立，open已经调用
	* 2：请求已接收，也就是接收到头信息了
	* 3：请求处理中，也就是接收到响应主体了
	* 4：请求已完成，且响应已就绪（完成）
```javascript
var request = new XMLHttpRequest();
request.open("GET","get.php",true);
request.send();
request.onreadystatechange = function() {
	if(request.readyState === 4 && request.status === 200){
		//request.responseText...
	}
}
```

## 用jQuery实现AJAX
* `jQuery.ajax([settings])`
	* `type`：类型，“POST”或“GET",默认"GET"
	* `url`：发送请求的地址
	* `data`：是一个对象，连同请求发送到服务器的数据
	* `dataType`：预期服务器返回的数据类型。如果不指定，jQuery将自动根据HTTP包MIME信息来只能判断，一般采用**json格式**，可以设置为**"json"**
	* `success`：是一个方法，请求成功后的回调函数。传入返回后的数据，以及包含成功代码的字符串
	* `error`：是一个方法，请求失败时调用此函数。传入XHR对象
```javascript
$.ajax({
	type:"GET",
	url:"get.php",
	dataType:"json",
	success:function(data){
		//成功后的操作
	},
	error:function(jqXHR){
		alert("error:"+jqXHR.status);
	}
})

$.ajax({
	type:"POST",
	url:"get.php",
	dataType:"json",
	data:{
		name:123
		number:123
		//jquery可以自动将Form Data转换成name:123&number:123这种格式
		//并自动设置Content-Type:application/x-www-form-urlencoded
	},
	success:function(data){
		//成功后的操作
	},
	error:function(jqXHR){
		alert("error:"+jqXHR.status);
	}
})
```

## 跨域
* 一个域名地址的组成：`http://www.abc.com:8080/scripts/jquery.js`
	* 协议：http://
	* 子域名：www
	* 主域名：abc.com
	* 端口号：8080（默认8080，可以省略）
	* 请求资源地址：scripts/jquery.js
* 当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域
* 不同域之间相互请求资源，算作“跨域”
  比如：`http://www.abc.com/index.html` 请求 `http://www.efg.com/service.php`
* JavaScript出于安全方面的考虑，不允许跨域调用其他页面的对象。简单说就是a.com域名下的js无法操作b.com或者c.a.com域名下的对象

## 处理跨域的方法
* 代理
  通过在同域名的web服务器端创建一个代理：
  北京服务器：`www.beijing.com`
  上海服务器：`www.shanghai.com`
  在北京的web服务器的后台`www.beijing.com/proxy-shanghaiservice.php`来调用`www.shanghai.com/service.php`的服务器，然后把响应结果返回给前端，这样前端调用北京同域名的服务就和调用上海的服务效果相同了
* JSONP
  JSONP可用于解决主流浏览器的跨域数据访问的问题（json+padding，内填充）

```html
在www.aaa.com中
 <script>
 function jsonp(json){
 	alert(json["name"]);
 }
 </script>
 <script src="http://www.bbb.com/jsonp.js"></script>

 在www.bbb.com中
 jsonp({"name":"tom","age":27});
```
```javascript
//jsonp只支持get请求
$.ajax({
	type:"GET",
	url:"http://www.bbb.com/service.php",
	dataType:"jsonp",
	jsonp:"callback",//取值任意，与后端相连接
	success:function(data){
		//成功后的操作
	},
	error:function(jqXHR){
		alert("error:"+jqXHR.status);
	}
})
```
* XHR2
  HTML5提供的XMLHttpRequest Level2已经实现了跨域访问以及其他的一些新功能（不支持IE10以下）
  在服务器端做一些小改造即可：
  `header('Access-Control-Allow-Origin:*');`
  `header('Access-Control-Allow-Methods:POST,GET');`