---
layout: post
title: axios上传图片，koa2接收保存上传的图片，lrz在上传前压缩图片
date: 2019-01-15 09:36:00
categories: nodejs学习笔记
tags: nodejs koa axios
author: 朋也
---

* content
{:toc}

## 后台接收图片

初始化koa2项目这里不多说，github上有个开源的koa-generator项目，安装运行一下初始化命令即可，readme上有详细介绍

不过有点要提一下，koa-generator脚手架里使用的是koa-bodyparser，这货不支持上传文件的解析，当初折腾这个纠结了一阵

这里使用koa2搭建服务端，使用koa-body，版本是 `"koa-body": "^4.0.6",`

安装 `yarn add koa-body`

app.js 里要修改一下，搜索一下 koa-bodyparser 把它相关的代码都去掉，然后加上下面代码






```js
const koaBody = require('koa-body');

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
  }
}));
```

开发上传路由处理上传文件操作

首先安装两个依赖，`mkdirp` `node-uuid` 前一个是创建多层文件夹的，后面是生成uuid作为文件名的，你如果要手动指定文件名，也可以不安装这个

```bash
yarn add mkdirp node-uuid
```

```js
const mkdirp = require('mkdirp');
const uuid = require('node-uuid');
const path = require('path')
const fs = require('fs')

// 上传文件
exports.upload = async ctx => {
  // 从请求参数里拿文件名，没有获取到就使用uuid生成一串uuid作为文件名
  const filename = ctx.request.body.filename || uuid.v4();
  const file = ctx.request.files.file;    // 获取上传文件
  if (file) {
    const reader = fs.createReadStream(file.path);    // 创建可读流
    const ext = file.name.split('.').pop();        // 获取上传文件扩展名
    // 创建文件夹
    const uploadPath = "/Users/hh/Desktop/upload"; // 这是我测试的路径
    const flag = fs.existsSync(uploadPath); // 判断文件夹是否存在
    // 同步创建多级文件夹
    if (!flag) mkdirp.sync(uploadPath);
    const upStream = fs.createWriteStream(`${uploadPath}/${filename}.${ext}`); // 创建可写流
    await reader.pipe(upStream);    // 可读流通过管道写入可写流
    ctx.body = {"code": 200, "description": "SUCCESS"};
  } else {
    ctx.body = {"code": 201, "description": "没有选择图片"};
  }
}
```

这样写完还有个问题，跨域，不过对于koa来说，没有一个中间件解决不了的，继续安装依赖

```bash
yarn add koa2-cors
```

在app.js 里做如下配置

```js
app.use(cors({
  origin: 'http://localhost:3001', // 这个域名就是上传页面所部署的服务的域名，根据自己的场景做相应的调整
  // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  // maxAge: 5,
  // credentials: true,
  allowMethods: ['POST'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
```

## 前端axios上传图片

之所以用它，是因为它默认有上传进度，瞎扯的，其实是因为它流行，网上流行啥，咱就用啥 :joy

实现逻辑说一下，有两种方式

1. 直接给一个 input[type="file"] 的html组件，点击后使用js监听 onchange 方法，然后在onchange方法里添加上传代码
2. 为了美观，可以给一个按钮和一个input[type="file"]不过这个file输入框要隐藏，当点击这个按钮的时候，使用js去手动的调用file输入框的点击事件，相当于鼠标点击了，后面都一样监听onchange事件即可

我这采用第一种方法
```html
<input type="file" id="imageFile" onchange="uploadImage()" style="display: none;">

<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js"></script>
<script>
function uploadImage() {
  var fd = new FormData();
  fd.append("image", document.getElementById("imageFile").files[0]);
  // 如果还想传一些参数，可以继续使用fd.append("filename", "自定义文件名");
  axios({
    method: 'POST',
    url: 'http://localhost:3000/upload',
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // 添加上传进度
    onUploadProgress: function(e) {
      var percentage = Math.round((e.loaded * 100) / e.total) || 0;
      if (percentage < 100) {
        console.log(percentage + '%');  // 上传进度
      }
    }
  }).then(resp => {
      console.log(resp.data);
  }).catch(err => console.log(err));
}
</script>
```

## 上传图片怎么能少了压缩呢

昨天网上搜了一下，发现一个很好用的工具 `lrz`

引入js

```bash
# 如果你是前端项目，直接安装
yarn add lrz
# 如果你想直接引入js，我在cdnjs上没有找这个，所以自己安装一下吧
bower install lrz
# 然后再引入
```

使用

```html
<script>
function uploadImage() {
  lrz(document.getElementById("imageFile").files[0])
    .then(rst => {
      var fd = new FormData();
      fd.append("image", document.getElementById("imageFile").files[0]);
      // 如果还想传一些参数，可以继续使用fd.append("filename", "自定义文件名");
      axios({
        method: 'POST',
        url: 'http://localhost:3000/upload',
        data: fd,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // 添加上传进度
        onUploadProgress: function(e) {
          var percentage = Math.round((e.loaded * 100) / e.total) || 0;
          if (percentage < 100) {
            console.log(percentage + '%');  // 上传进度
          }
        }
      }).then(resp => {
        console.log(resp.data);
      }).catch(err => console.log(err));
    }).catch(function (err) {
      // 处理失败会执行
      console.log("压缩图片失败!");
      Toast.hide();
    }).always(function () {
      // 不管是成功失败，都会执行
    });
}
</script>
```

实测，一张8M+图片，压缩上传后，图片大小不到2M，还很清晰

## 参考

- [https://github.com/think2011/localResizeIMG](https://github.com/think2011/localResizeIMG)
- [https://github.com/axios/axios](https://github.com/axios/axios)
- [https://github.com/17koa/koa-generator](https://github.com/17koa/koa-generator)
