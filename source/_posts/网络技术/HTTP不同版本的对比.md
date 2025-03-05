---
title: HTTP不同版本的对比
categories:
  - 网络技术
tags:
  - HTTP/1
  - HTTP/2
  - HTTP/3
date: 2025-03-05 17:20:35
---

### **什么是 HTTP?**

HTTP（超文本传输协议）是万维网（注意区分「万维网」和「互联网」）中数据传输的规则。它有三个主要版本，我们将逐一解析。

简单来说，HTTP 协议定义了浏览器如何与服务器通信以交换数据。所有版本的核心逻辑都是：浏览器发送「请求」，服务器返回「响应」。随着时间推移，协议变得越来越复杂，而理解这些改进对开发者至关重要。

### HTTP/1.x

HTTP/1.0 于 1996 年发布，HTTP/1.1 于 1999 年推出并迅速普及。

**工作原理示例**：

1. 用户访问 `accreditly.io`（以某网站为例），浏览器发送请求：
   
   ```http
   GET accreditly.io
   ```

2. 服务器响应 HTML 文档：
   
   ```http
   200 OK
   <html>...</html>
   ```

3. 浏览器解析文档并依次请求其中的资源（图片/CSS/JS）。

**HTTP/1.x 的核心问题**：

1. **队头阻塞（Head-of-line blocking）**：
   
   每个连接只能处理一个请求，后续请求必须排队等待。

2. **无优先级控制**：
   
   无法指定资源加载优先级，次要资源可能阻塞关键内容。

3. **文本协议开销大**：
   
   尤其在使用 Cookie 时，头部信息冗余严重。

这些问题对现代网页性能影响显著。而对于以上这些问题，也存在着以下一些解决方案：

1. **域名分片**
   
   ```nginx
   # Nginx 配置示例（多个子域名指向同一服务）
   server {
       listen 80;
       server_name static1.example.com static2.example.com static3.example.com;
       root /var/www/static;
   }
   ```
   
   前端资源引用：
   
   ```html
   <!-- 分散到不同子域名 -->
   <img src="https://static1.example.com/logo.png">
   <script src="https://static2.example.com/app.js"></script>
   <link href="https://static3.example.com/style.css">
   ```

2. **资源合并**
   
   例如使用 webpack 等工具将多个小文件合并为一个大的文件，如 `vendors.js` 和 `styles.css`；使用精灵图合并图片。

3. **内联**
   
   将高优先级资源或小资源通过script标签或style标签或dataUrl的形式直接内嵌在页面里。

4. **Gzip压缩**

5. **缓存策略**

6. **CDN加速**

### HTTP/2

2015 年发布的 HTTP/2 旨在解决上述问题。现代网页体积庞大，但网络速度的改进远不及资源需求的增长。

**HTTP/2 的杀手锏**：

1. **多路复用（Multiplexing）**：  
   浏览器通过单个连接并行请求所有资源，服务器同时响应。  
   ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/http2.png?imageSlim)

2. **其他优化**：
   
   - **头部压缩**：使用 HPACK 算法减少头部体积。
   - **服务器推送（Server Push）**：主动推送资源到客户端缓存。
   - **流优先级（Stream Prioritization）**：允许优先加载关键资源。
   - **二进制分帧（Binary Framing）**：协议更高效且抗干扰。

**局限**：仍基于 TCP 协议，存在 TCP 的固有缺陷（如高延迟网络下的性能问题）。

那么针对HTTP/1.x的前端优化还应该继续使用吗？答案是以下几种方式可以废弃了：

* **域名分片**：HTTP/2 的多路复用特性允许通过单个连接并行传输多个资源，而 HTTP/1.x 的分片会强制建立多个 TCP 连接，可能反而降低性能。

* **资源合并**：HTTP/1.x 中合并 CSS/JS 文件以减少请求次数，但 HTTP/2 中多个小文件可以并行加载，合并大文件可能导致缓存失效成本增加。

* **精灵图**：HTTP/2 的多路复用解决了图片并发请求限制，精灵图会增加维护成本。

### HTTP/3

HTTP/3 抛弃 TCP，改用基于 UDP 的 **QUIC 协议**（Quick UDP Internet Connections）。

**QUIC 的核心优势**：

1. **内置加密**：默认集成 TLS 1.3，减少握手延迟。
2. **消除队头阻塞**：丢包仅影响单个流，而非整个连接。
3. **连接迁移**：更换 IP 地址时保持连接（对移动设备友好）。
4. **0-RTT 连接**：对已访问过的服务器可跳过握手。
5. **智能拥塞控制**：动态适应网络变化。

**挑战**：

- 网络基础设施对 UDP 的支持有限（许多网络屏蔽 UDP）。
- 浏览器兼容性参差不齐。
