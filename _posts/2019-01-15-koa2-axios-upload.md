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

更新：工作中有个要计算上传图片后计算图片的md5的任务，所以这里多加一个依赖 `md5`

```bash
yarn add mkdirp node-uuid md5
```

```js
const mkdirp = require('mkdirp');
const uuid = require('node-uuid');
const path = require('path');
const fs = require('fs');
const md5 = require('md5');

// 上传文件
exports.upload = async ctx => {
  const result = await uploadFile(ctx);
  console.log(result);
  ctx.body = {"code": 200, "description": "SUCCESS"};
}

// 通过 Promise 封装一个同步上传图片的方法，只有在图片上传完，或者上传报错了才会有返回值
// 既然是Promise封装的，当然可以使用 async/await 来同步执行它了
// 我在开发上传功能的时候碰到一个需求，上传图片完成后计算一下图片的md5，目的是对图片去重，结果nodejs里的IO流里完成后的处理要在 finish 事件里处理
// 但项目又是用的koa，路由里还用了async/await，直接把ctx.body写在finish事件里运行还报错
// 然后上网查资料，群里跟大伙讨论后找到了解决办法，就是通过Promise封装一个上传方法来解决，代码就是下面这些
// 趟了这个坑，后面再碰到要等逻辑执行完才能处理的任务，就可以套用了，爽歪歪
function uploadFile(ctx) {
  console.log("开始上传图片。。。");
  const filename = ctx.request.body.filename || uuid.v4();
  const file = ctx.request.files.file;
  const ext = file.name.split('.').pop();        // 获取上传文件扩展名
  // 创建文件夹
  const uploadPath = "/Users/hh/Desktop/upload"; // 这是我测试的路径
  const flag = fs.existsSync(uploadPath); // 判断文件夹是否存在
  // 同步创建多级文件夹
  if (!flag) mkdirp.sync(uploadPath);
  // 文件全路径
  const filePath = `${uploadPath}/${filename}.${ext}`;
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(file.path);
    const upStream = fs.createWriteStream(filePath); // 创建可写流
    // 对写入流进行事件监听
    // upStream.on('open', function () {
    //   console.log("open");
    // });
    // 流写入成功后调用的事件，在这里处理返回结果
    upStream.on('finish', function () {
      console.log("finish");
      // 对图片计算md5值的，你也可以处理自己的逻辑，然后通过 resolve() 函数将处理的结果返回即可
      const buf = fs.readFileSync(filePath);
      const hash = md5(buf);
      resolve({md5: hash});
    });
    // upStream.on('close', function () {
    //   console.log("close");
    // });
    upStream.on('error', function (err) {
      // 有错误的话，在这个里面处理
      console.log("error", err);
      reject(err)
    });
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
  });
}
```

这样写完还有个问题，跨域，不过对于koa来说，没有一个中间件解决不了的，继续安装依赖

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
