---
layout: post
title: thymeleaf模板布局用法
date: 2017-03-09 15:34:20
categories: spring-boot学习笔记
tags: thymeleaf
author: 朋也
---

* content
{:toc}

thymeleaf的layout常用的有两种方式用法

## 第一种

将页面里的每个部分都分成 `块` -> `fragment` 使用 `th:include` 和 `th:replace` 来引入页面

这种用法没有layout的概念, 因为每个部分都是 `fragment`, 下面例子说明

```html
<!-- index.html -->
<html>
  <head>
    <meta charset="utf-8"/>
    <title>demo</title>
  </head>
  <body>
    <div th:include="components/header :: header"></div>
    <div class="container">
      <h1>hello world</h1>
    </div>
    <div th:include="components/footer :: footer"></div>
  </body>
</html>
```




```html
<!-- components/header.html -->
<header th:fragment="header">
  <ul>
    <li>news</li>
    <li>blog</li>
    <li>post</li>
  </ul>
</header>
```

```html
<!-- components/footer.html -->
<header th:fragment="footer">
  <div>i am footer.</div>
</header>
```

上面例子里用到的是`th:include`, 也就是把定义好的`fragment`引入的意思, 还有一个是`th:replace`, 意思是替换当前页面里的这部分代码, 下面例子说明一下

原链接文：[https://atjiu.github.io/2017/03/09/thymeleaf-layout/](https://atjiu.github.io/2017/03/09/thymeleaf-layout/)

```html
<html>
  <head>
    <meta charset="utf-8"/>
    <title>demo</title>
  </head>
  <body>
    <div th:replace="components/header :: header">
      <!-- 使用th:replace进来的header.html会替换下面的这个header -->
      <header>
        <ul>
          <li>static - news</li>
          <li>static - blog</li>
          <li>static - post</li>
        </ul>
      </header>
    </div>
    <div class="container">
      <h1>hello world</h1>
    </div>
    <div th:include="components/footer :: footer"></div>
  </body>
</html>
```

## 第二种

写一个layout.html页面,当作页面的基础页面

```html
<!-- layout/layout.html -->
<html>
  <head>
    <meta charset="utf-8"/>
    <title>demo</title>
  </head>
  <body>
    <div th:include="components/header :: header"></div>
    <div layout:fragment="content"></div>
    <div th:include="components/footer :: footer"></div>
  </body>
</html>
```

在子页面里使用 `layout:decorator` 来将子页面里的内容加入到 layout.html里去

```html
<!-- index.html -->
<html layout:decorator="layout/layout">
  <head>...</head>
  <body>
    <div layout:fragment="content">
      <h2>hello world!!!</h2>
    </div>
  </body>
</html>
```

这样在layout.html里引入的css,js,imgs都可以在子页面里用了,而且在子页面里还可以引入子页面需要用到的css,js,imgs, 就很方便了 **推荐**

## 模板传值

假如要往header.html里传入一个tab来区别应该高亮哪个菜单,可以使用下面的写法实现

先定一个样式

```css
.active {
  background-color: green;
}
```

接原链文：[https://atjiu.github.io/2017/03/09/thymeleaf-layout/](https://atjiu.github.io/2017/03/09/thymeleaf-layout/)


```html
<header th:fragment="header (tab)">
  <ul>
    <li><span th:class="${tab eq 'news'} ? active">news</span></li>
    <li><span th:class="${tab eq 'blog'} ? active">blog</span></li>
    <li><span th:class="${tab eq 'post'} ? active">post</span></li>
  </ul>
</header>
```

调用写法

```html
<div th:include="components/header :: header(tab='blog')"></div>
```

---

## 更新(上面配置方法失效解决办法)

不清楚是不是thymeleaf版本更新了还是springboot版本更新了的原因, 上面配置方法 `th:fragment` 还是可以用的, 但`layout:decorator` 失效了, 按照上面配置方法, 在写博客的时候是没有问题的, 但现在不行了, 下面说一下更新后的配置方法

环境

- springboot　2.1.4.RELEASE
- thymeleaf 3.0.11

其它什么都不用动的, 只要在 `pom.xml` 文件里引入一个依赖即可解决失效问题

```xml
<dependency>
  <groupId>nz.net.ultraq.thymeleaf</groupId>
  <artifactId>thymeleaf-layout-dialect</artifactId>
</dependency>
```

快来试试吧!

## 总结

上面使用 `th:fragment`的方式来定义 `片段` 然后在其它地方可以通过 `th:include` 或者 `th:insert` 或者 `th:replace` 的方式来引入, 这样可以把页面拆分成若干部分, 可以少写很多重复代码, 挺好用的

**但是** `layout:decorator` 引入的模板就没办法传值了, 这样就导致一个问题, 如果header里要根据 `tab` 来更新选中状态的话, 就只能在 `Controller` 里传到页面上了, 在这一个功能上它没有 `freemarker`　的　`macro` 好用

不过thymeleaf里内置了大量的属性, 会用了也是极其方便的, 看个人爱好了

## 参考

[http://www.thymeleaf.org/doc/articles/layouts.html](http://www.thymeleaf.org/doc/articles/layouts.html)

