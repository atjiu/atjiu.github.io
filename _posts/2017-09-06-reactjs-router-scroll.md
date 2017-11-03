---
layout: post
title: React.js里使用React-Router返回滚动状态没法保存问题的解决过程整理
catatories: react.js学习笔记
tags: react.js react-router react-router-scroll
author: 朋也
---

* content
{:toc}

使用版本：react-router-dom (v4)

问题描述：

页面List往下翻一下，然后点击其中的某一项，到Detail页面，然后再返回到List，List会回到顶部，而不是在之前的滚动位置





关于这个问题的解决办法，在网上找了一堆的文章，开源项目，大致分为以下两类

1. 使用React-Router (v4) ，都用了redux，可以实现，但还是存在问题，当点击到Detail的时候，在Detail往下滚动一点，再返回到列表，然后再点一项，这里Detail就是在之前那个Detail往下滚动的位置了
2. 其它都是使用React-Router (v2, v3) 了，结合React-Router-Scroll，可以实现，我也是在项目中将React-Router (v4) 换成了 (v2) 外加上 React-Router-Scroll 解决的问题

但在使用的过程中还是碰到问题了

我项目中的页面分为，Header, Section, Footer三个部分，Section用了绝对布局，页面的滚动被css控制了，所以死活就是记不住之前的滚动位置，折腾了好久，最后把Section部分的布局样式的绝对布局去掉了，什么都好了

**说明：**

关于使用Redux跟页面滚动没有必然联系，我开发这个项目的时候 ，最开始没用redux，然后网上找的项目还都是用了redux的，这就导致我一直以为用了redux之后问题就会解决，然后花了两天时间给项目加上了redux，问题还是存在，心累！！

redux的使用是缓存页面上数据的好办法，当然，如果项目中父子组件之前的交流较多的话，用redux会方便很多，但如果项目中每个页面都比较相对独立，父子组件交流也比较少的话，就没必要用上redux，那样只会加深项目的复杂性

最后，页面数据的缓存也可以使用 localStorage, sessionStorage 等来实现，当然都会有一些浏览器的兼容问题，特别是safari的无痕模式下，请注意一下
