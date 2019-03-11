---
layout: post
title: 使用koa2创建web项目
date: 2019-03-11 21:21:00
categories: nodejs学习笔记
tags: java
author: 朋也
---

* content
{:toc}

> Github上有一个express风格的koa脚手架，用着挺方便，一直以来使用koa开发web项目用的也都是那个脚手架，今天想自己从头搭一个web项目，就折腾了一下
>
> 脚手架地址：https://github.com/17koa/koa-generator

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
npm install --save koa koa-body koa-logger koa-json-error koa-router
```

- koa
- koa-body 解析http请求参数的，支持 `multipart/form-data` `application/x-www-urlencoded` `application/json` 三种参数类型
- koa-logger 显示http请求的日志
- koa-router 路由
- koa-json-error 程序出异常输出json

原链文接：[https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/]([https://tomoya92.github.io/2019/02/21/java11/](https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/))

## 配置

在根目录下创建 `app.js` 然后贴上下面代码，代码内有注释，很简单

```js
// 引入依赖
const koa = require('koa');
const koa_body = require('koa-body');
const koa_json_error = require('koa-json-error');
const koa_logger = require('koa-logger');

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

router.get('/index', index.index);
router.get('/index:id', index.index);
router.post('/index', index.index);
router.get('/test_error', index.test_error);

module.exports = router
```

链原文接：[https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/]([https://tomoya92.github.io/2019/02/21/java11/](https://tomoya92.github.io/2019/03/11/creat-web-with-koa2/))

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

浏览器访问 http://localhost:3000/index/ 可以看到输出的json

```json
{
  "body": {},
  "query": {},
  "params": {}
}
```

访问 http://localhost:3000/index/?id=1

```json
{
  "body": {},
  "query": {
    "id": "1"
  },
  "params": {}
}
```

访问 http://localhost:3000/index/1

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

访问 http://localhost:3000/test_error

```json
{
  "code": 500,
  "description": "测试异常"
}
```

## 总结

写博客不易，转载请保留原文链接，谢谢!