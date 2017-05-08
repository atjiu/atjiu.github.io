---
layout: post
title: express集成socket.io实现站内通知
date: 2017-05-08 09:29:44
categories: nodejs学习笔记
tags: nodejs express socket.io
author: 朋也
---

* content
{:toc}

## 初始化项目

```sh
npm install -g express-generator
express demo
cd demo && npm install
```

## 安装socket.io

```sh
npm install --save socket.io
```

在routes文件夹里创建文件 `io.js`




```
── routes
   ├── io.js
```

## 初始化socket.io

在bin/www里添加上下面代码

```js
var io = require('socket.io')(server);
require('../routes/io')(io);
```

位置如下

```js
//...

var app = require('../app');
var debug = require('debug')('tomoya-cn:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var io = require('socket.io')(server);
require('../routes/io')(io);

//...
```

## 测试连接

```js
//io.js

module.exports = function(io) {
	io.on('connection', function(socket) {

    // user connect
		socket.on('user joined', function(data) {
      io.sockets.emit('msg', {
				code: 700, // user joined
        username: data
			});
    })

    //user disconnect
    socket.on('disconnect', function() {
			io.sockets.emit('msg', {
				code: 701, // user login
			});
		});
  })
}
```

页面里用法

```html
<script type="text/javascript">
  var socket = io();

  //向服务端发消息告知用户加入
  socket.emit('user joined', {
    username: 'hello'
  });

  //服务端反馈回来的消息接收
  socket.on('msg', function (data) {
    console.log(data);
  });
</script>
```

## 系统消息通知实现

用户回复话题后，调用

`socket.emit('send msg', {//TODO})` 告诉服务端有新消息，服务端通过传的参数处理数据，然后发送给指定用户 `socket.to(id).emit()`

## 参考

- <https://socket.io/>
