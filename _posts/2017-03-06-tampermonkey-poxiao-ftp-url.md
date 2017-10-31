---
layout: post
title: Tampermonkey里自己写脚本，实现破晓电影下载链接显示在页面上方便复制
date: 2017-03-06 10:54:20
categories: 脚本
tags: javascript tampermonkey
author: 朋也
---

* content
{:toc}

> 原因：mac上点击破晓电影下载页面不能调用迅雷，复制链接地址也不对，就写了个脚本把下载ftp地址提取出来，供复制下载用

## 准备

首先在chrome里装上Tampermonkey插件 [下载地址](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=chrome-ntp-icon) 

![](//ww1.sinaimg.cn/large/ce56395agy1fdcwp5w10zj21ii12ydtr)

## 代码

点击添加新脚本

在编辑框里写上下面代码




```javascript
// ==UserScript==
// @name         破晓电影网ftp下载链接提取出来
// @namespace    http://*poxiao.com/
// @version      0.1
// @description  将poxiao电影下载ftp链接提取出来，放到下面供复制，原因：mac上点击链接不能调用迅雷
// @author       tomoya
// @match        http*://www.poxiao.com/movie/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var e_ftps = document.getElementsByTagName("input");
    for(i = 0; i < e_ftps.length; i++) {
        if(e_ftps[i].name == 'checkbox2') {
            var ftp = e_ftps[i].value.replace('xzurl=', '');
            var e_div = document.createElement('div');
            var e_a = document.createElement("a");
            e_a.href = 'javascript:;';
            e_a.innerHTML = ftp;
            e_div.appendChild(e_a);
            e_ftps[i].parentNode.appendChild(e_div);
        }
    }
})();
```

## 测试

打开Chrome http://www.poxiao.com/movie/42008.html

下载列表里就已经有ftp的下载地址了

![](//ww1.sinaimg.cn/large/ce56395agy1fdcwueepnzj20l005075c)

**此方法还可以写其它网页的脚本，比如改变页面的样式，布局，按照自己习惯自己写些功能自己用，都相当方便，也可以把自己的脚本上传到网站：https://greasyfork.org ，当然上面也有很多非常好用的插件**

END.
