---
layout: post
title: RestTemplate下载阿里云OSS文件403错误
date: 2022-02-24 10:00:00
categories: java学习笔记
tags: resttemplate
author: 朋也
---

* content
{:toc}





当aliyun oss对某个文件设置过期时间访问时，在浏览器里能正常打开，但使用resttemplate下载就一直403，如下图

![](/assets/images/1645668018136.png)

解决办法非常简单，给请求头设置上 `User-Agent` 就行了。

























