---
layout: post
title: thymeleaf模板布局用法
date: 2017-03-09 15:34:20
categories: spring-boot学习笔记
tags: thymeleaf template
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

相关链接:

[http://www.thymeleaf.org/doc/articles/layouts.html](http://www.thymeleaf.org/doc/articles/layouts.html)

END
