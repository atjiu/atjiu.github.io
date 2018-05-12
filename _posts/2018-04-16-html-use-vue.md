---
layout: post
title: 在非NodeJS项目里使用Vue
date: 2018-04-16 16:08:44
categories: vue.js学习笔记
tags: vue.js
author: 朋也
---

* content
{:toc}

> 背景: 作为一个后台开发人员，有时候想用一下前端的框架来构建页面，总结一下在非NodeJS项目里用Vue的方法

## 引入JS

国内就用 https://bootcdn.cn 上找一下vue的链接就可以了





## 用法

```html
<!DOCTYPE html>
<html>
<head>
  <title>DEMO</title>
  <script src="https://cdn.bootcss.com/vue/2.5.17-beta.0/vue.min.js"></script>
</head>
<body>
  <div id="app">
    <my_template :datas="books"></my_template>
    <br>
    <my_template :datas="cars"></my_template>
  </div>

  <!-- 定义利用的模板 -->
  <script type="text/x-template" id="tpl">
    <ul>
      <li v-for="_data in datas">{{_data.name}} - {{_data.price}}</li>
    </ul>
  </script>

  <script>
    // 在Vue中注册模板
    Vue.component('my_template', {
      props: ['datas'],
      template: '#tpl'
    });

    new Vue({
      el: '#app',
      data: {
        books: [{
          name: 'Tomcat',
          price: 20
        }, {
          name: 'Jetty',
          price: 22
        }, {
          name: 'Spring',
          price: 40
        }],
        cars: [{
          name: 'BMW',
          price: 1000000
        }, {
          name: 'AUDI',
          price: 2000000
        }]
      }
    })
  </script>
</body>
</html>
```

## 运行结果

![](https://tomoya92.github.io/assets/html-use-vue.png)

## 参考

- https://cn.vuejs.org
