---
layout: post
title: 使用koa2创建web项目
date: 2019-03-11 21:21:00
categories: nodejs学习笔记
tags: koa
author: 朋也
---

* content
{:toc}

> Github上有一个express风格的koa脚手架，用着挺方便，一直以来使用koa开发web项目用的也都是那个脚手架，今天想自己从头搭一个web项目，就折腾了一下
>
> 脚手架地址：[https://github.com/17koa/koa-generator](https://github.com/17koa/koa-generator)

## 初始化

使用 `npm init ` 初始化一个nodejs项目

```bash
mkdir koa-demo
cd koa-demo
npm init
```

一直回车即可，创建好之后目录里会有一个`package.json`文件






## 安装依赖

```bash
npm install --save koa koa-body koa-logger koa-json-error koa-router koa-static koa-njk
```

- koa
- koa-body 解析http请求参数的，支持 `multipart/form-data` `application/x-www-urlencoded` `application/json` 三种参数类型
- koa-logger 显示http请求的日志
- koa-router 路由
- koa-json-error 程序出异常输出json
- koa-static 映射静态资源文件
- koa-njk nunjucks模板解析

原链文接：[https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/](https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/)

## 配置

在根目录下创建 `app.js` 然后贴上下面代码，代码内有注释，很简单

```js
// 引入依赖
const koa = require('koa');
const koa_body = require('koa-body');
const koa_json_error = require('koa-json-error');
const koa_logger = require('koa-logger');
const koa_static = require('koa-static');
const koa_njk = require('koa-njk');
const path = require('path');

// 初始化koa
const app = new koa()

// 引入路由配置文件，这个在下面说明
const routers = require('./routes/routers');

// 配置程序异常输出的json格式
app.use(koa_json_error((err) => {
  return {
    code: err.status || 500,
    description: err.message
  }
}));

// 添加静态资源文件映射
app.use(koa_static(path.join(__dirname, 'static')))
// 添加nunjucks模板
app.use(koa_njk(path.join(__dirname, 'views'), '.njk', {
  autoescape: true,
}, env => {
  // 添加自己的过滤器
  env.addFilter('split', (str, comma) => {
    if (str) {
      return str.split(comma);
    } else {
      return '';
    }
  });
}));

// 解析表单提交参数
app.use(koa_body());
// 显示请求和响应日志
app.use(koa_logger());

// 路由
app.use(routers.routes())

// 程序启动监听的端口
const port = 3000;

app.listen(port);
console.log('Listening on ' + port);
```

## 路由

在根目录下创建 `routes` 文件夹

在 `routes` 文件夹内创建 `index.js` `routers.js` 文件

在 `index.js` 文件内添加如下代码

```js
// 测试路由，输出请求的参数
exports.index = async ctx => {
  const body = ctx.request.body;
  const query = ctx.request.query;
  const params = ctx.params;
  ctx.body = {
    body: body,
    query: query,
    params: params,
  };
}

// 测试nunjucks模板
exports.view = async ctx => {
  await ctx.render('index', {
    title: 'Koa'
  })
}

// 测试异常
exports.test_error = async ctx => {
  throw new Error('测试异常');
}
```

配置路由，在`routers.js`文件内配置路由

```js
const router = require('koa-router')();

// route
const index = require('./index');

router.get('/view', index.view);
router.get('/index', index.index);
router.get('/index:id', index.index);
router.post('/index', index.index);
router.get('/test_error', index.test_error);

module.exports = router
```

链原文接：[https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/](https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/)

## 静态文件

在根目录创建文件夹 `static` 添加 `app.css` 文件，写上下面代码

```css
body {
  background-color: #eee;
}
```

## 模板

在根目录创建文件夹 `views` 添加 `index.njk` 文件，写上下面代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/app.css">
</head>
<body>

Hello, {{ title }}! <br>

<ul>
  <!-- 使用自定义的过滤器 -->
  {% for book in books|split(',') %}
    <li>{{ book }}</li>
  {% endfor %}
</ul>

</body>
</html>

```

## 启动

安装 `nodemon`

```bash
npm install -g nodemon
```

在根目录运行命令启动项目

```bash
nodemon app.js
```

## 测试

访问 `http://localhost:3000/view/`

![](/assets/20190311221225.png)

访问 `http://localhost:3000/index/` 可以看到输出的json

```json
{
  "body": {},
  "query": {},
  "params": {}
}
```

访问 `http://localhost:3000/index/?id=1`

```json
{
  "body": {},
  "query": {
    "id": "1"
  },
  "params": {}
}
```

访问 `http://localhost:3000/index/1`

```json
{
  "body": {},
  "query": {},
  "params": {
    "id": "1"
  }
}
```

POST 请求 `curl -X POST http://localhost:3000/index/ -d '{"id": "1"}' -H 'Content-Type:application/json'`

```json
{
  "body":{
    "id":"1"
  },
  "query":{},
  "params":{}
}
```

访问 `http://localhost:3000/test_error`

```json
{
  "code": 500,
  "description": "测试异常"
}
```

## 总结

写博客不易，转载请保留原文链接，谢谢!