---
layout: post
title: koa与socket.io整合，共用一个端口，避免跨域问题
date: 2020-04-23 10:53:00
categories: javascript学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}

先上图

![](/assets/images/socket.io-koa-integrate.gif)






## 创建koa项目

可以参考我以前发的一篇博客：[使用koa2创建web项目](https://atjiu.github.io/2019/03/11/creat-web-with-koa2/)

## 添加依赖

添加socket.io的依赖

```
yarn add socket.io
```

在app.js里稍作修改即可

```js
// 引入依赖
const koa = require("koa");
const koa_body = require("koa-body");
const koa_logger = require("koa-logger");
const koa_njk = require("koa-njk");
const path = require("path");

// 初始化koa
const app = new koa();

var server = require("http").createServer(app.callback());
const io = require("socket.io")(server);

// 引入路由配置文件，这个在下面说明
const routers = require("./routes/routers");

// 添加nunjucks模板
app.use(
    koa_njk(path.join(__dirname, "views"), ".html", {
        autoescape: true,
    })
);

// 解析表单提交参数
app.use(koa_body());
// 显示请求和响应日志
app.use(koa_logger());

// 路由
app.use(routers.routes());

const moment = require("moment");

// socket.io
io.of("ws").on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    setInterval(function () {
        socket.broadcast.emit("broadcast", moment().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);

    socket.on("echo", (msg) => {
        console.log("echo from client: ", msg);
        socket.emit("echo", msg);
    });
});

// 程序启动监听的端口
const port = 3000;

server.listen(port);
console.log("Listening on " + port);
```

接文链原: [https://atjiu.github.io/2020/04/23/socketio-koa-integrate/](https://atjiu.github.io/2020/04/23/socketio-koa-integrate/)

## 页面

最后放上上面动图中的页面

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hello Socket.io</title>
    </head>
    <body>
        <h1>Hello World</h1>
        <p>Current Time: <span id="time"></span></p>

        <input type="text" id="type-msg" placeholder="type something.." />
        <p>Echo from server: <span id="server-echo-msg"></span></p>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>

        <script>
            var socket = io("ws://localhost:3000/ws");

            socket.on("broadcast", function (msg) {
                document.getElementById("time").innerText = msg;
            });

            document.getElementById("type-msg").addEventListener("input", function (e) {
                var value = e.target.value;
                socket.emit("echo", value);
            });

            socket.on("echo", function (msg) {
                document.getElementById("server-echo-msg").innerText = msg;
            });
        </script>
    </body>
</html>
```