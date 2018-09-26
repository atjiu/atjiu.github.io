---
layout: post
title: Nodejs爬虫，使用cheerio+request+phantomjs实现超简单爬虫
date: 2018-09-20 15:22:00
categories: nodejs学习笔记
tags: nodejs cheerio request phantomjs
author: 朋也
---

* content
{:toc}

> 之前写过golang里比较好用的爬虫工具是 goquery [[传送门]](https://tomoya92.github.io/2017/06/21/golang-goquery/)
>
> 今天来介绍一下nodejs里的爬虫





## 创建项目

使用npm初始化一个nodejs项目

```sh
# 创建一个文件夹 crawling
mkdir crawling
# 进入文件夹并初始化
cd crawling
npm init
```

安装依赖

```sh
yarn add cheerio request iconv-lite
```

- cheerio 像jquery一样用来解析网页的
- request http请求的工具
- iconv-lite request默认编码是utf-8, 如果网页不是utf-8编码，可以用来转码

## 封装一下request

```js
var request = require('request');
var iconv = require('iconv-lite');

module.exports = function(url, method, encoding, callback) {
  request({
    url: url,
    method: method,
    encoding: null,
    // proxy: 'http://127.0.0.1:1087',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    }
  }, function(err, res, body) {
    body = iconv.decode(body, encoding);
    if (err) {
      console.log(err);
    } else {
      callback(body);
    }
  })
}
```

## 开始爬取

```js
var request = require('./request');
var cheerio = require('cheerio');

function fetch() {
  request('https://cnodejs.org/', 'get', 'utf-8', function(body) {
    var $ = cheerio.load(body);
    $('#topic_list').find('.cell').each(function(i, v) {
      var title = $(v).find('.topic_title').text();
      var href = 'https://cnodejs.org' + $(v).find('.topic_title').attr('href');
      console.log(title, href);
    })
  })
}
```

运行结果

![](https://tomoya92.github.io/assets/QQ20180920-153905.png)

## 抓取网站是js渲染的

现在前端这么流行，很多网站都是用js框架写的了，这导致页面都是用js渲染的，普通的http请求拿到的只是html页面，它不会执行js，所以也就没有内容了，下面介绍一下用phantomjs来抓取js渲染的网页内容

这里用网易新闻手机版的，打开链接 https://3g.163.com/touch/news/ 然后查看页面源代码，可以看到body里是没有内容的

![](https://tomoya92.github.io/assets/QQ20180920-161342.png)

安装依赖

```sh
yarn add phantom
```

```js
var phantom = require('phantom');

function news() {
  var sitepage, phInstance;
  phantom.create()
    .then(function (instance) {
      phInstance = instance;
      return instance.createPage();
    }).then(function (page) {
      sitepage = page;
      return page.open('https://3g.163.com/touch/news/');
    }).then(function (status) {
      return sitepage.property('content');
    }).then(function (content) {
      var $ = cheerio.load(content);
      $(".recommend-list>article").each(function (i, v) {
        var title = $(v).find('.title').text();
        var href = $(v).find('a').attr('href');
        console.log(title, href);
      });
    }).then(function() {
      sitepage.close();
      phInstance.exit();
    }).catch(function (err) {
      phInstance.exit();
    })
}
```

运行结果

![](https://tomoya92.github.io/assets/QQ20180920-161241.png)
