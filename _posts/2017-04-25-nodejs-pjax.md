---
layout: post
title: express里使用pjax实现页面无刷新加载
date: 2017-04-25 10:00:00
categories: nodejs学习笔记
tags: nodejs pjax
author: 朋也
---

* content
{:toc}

[jquery-pjax下载地址](https://github.com/defunkt/jquery-pjax)

先看下pjax的浏览器兼容版本

![](https://tomoya92.github.io/assets/QQ20170425-100117.png)

## 创建项目，引入文件

创建一个express项目，引入jquery, jquery-pjax 文件




## 写一个拦截器

```js
var pjaxFilter = function(req, res, next) {
  if (req.get('X-PJAX')) {
    next();
  } else {
    //如果不是pjax请求的话直接返回布局模板
    res.render('layout', { title: '首页' });
  }
};
```

**说明：在要使用pjax的路由中加上拦截器，不用pjax的，就不要加，拦截器的作用是判断是不是pjax请求，是就直接去加载数据，生成页面，填充到页面里，不是的话，就加载一下模板，这样可以防止加载再次模板，在`layout.ejs`里会通过`$.pjax.reload('#container')`去加载页面内容，这也就是直接在浏览器里输入网址也会加载数据的原因**

```js
//...
app.get('/', pjaxFilter, Index.index);
app.get('/logout', Index.logout);
//...
```

## 页面实现

```html
//layout.ejs
<!DOCTYPE html>
<html>
<head>
  <title>首页</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">

  <link rel='stylesheet' href='/stylesheets/style.css'/>

  <script src="/javascripts/jquery.pjax.min.js"></script>
</head>
<body>
<div class="box">
  <h1 class="title"><a href="/" data-pjax>DEMO</a></h1>
  <div id="container"></div>
</div>
<script>
  $(function () {
    $(document).pjax('a[data-pjax]', '#container');
    $.pjax.reload('#container');

//    $(document).on('pjax:success', function (data, status, xhr, options) {
//    });
  })
</script>
</body>
</html>
```

**说明：github上介绍给的demo是直接给 a 标签加上pjax事件的，这里我用data-pjax做了个区别，目的是跟普通a标签区别开，要用pjax无刷新加载的就加上data-pjax就可以了，不需要的直接写个a标签就可以了**

## 填充页面实现

```js
//路由
exports.index = function(req, res) {
  res.render('', {
    name: 'word!',
    layout: req.get('X-PJAX')
  })
}
```

```html
<div>hello <%=name%></div>
```

**说明：我这里用的是ejs模板，路由返回里加入的layout属性是为了判断是否引用layout.ejs页面的，layout:false即为不引用，所以这里加上了一个通过判断是不是pjax请求的方式，如果是pjax请求，就引用模板，然后在layout.ejs里有个`$.pjax.reload('#container')`操作，会更新id='container'里的内容**

## 其它相关

- 在加载的页面里（非布局页面）也可以使用data-pjax，来让a标签有pjax事件
- 如果加载页面失败了，可能会出现重复加载页面的现象，这个要把错误处理好，就不会出现了
- 在加载的页面里（非布局页面）如果有ajax操作，删除了数据，可以直接使用`$.pjax.reload('#container')`来无刷新的重新加载当前页面（比如：$.get('', function(data){if(data.code === 200) {$.pjax.reload('#container')}});）
- 这里用的是nodejs里的express框架，它只是一个web框架，所以pjax跟express没有关系，相同的，在springmvc，beego等框架里都是可以用的，只是注意跟框架的模板配合好就可以了

## 参考资料

- [使用pjax实现类似github无刷新更改页面url](http://www.html-js.com/article/2653)
- [https://github.com/weiyuc/java-pjax](https://github.com/weiyuc/java-pjax)
