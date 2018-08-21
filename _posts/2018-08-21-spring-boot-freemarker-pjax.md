---
layout: post
title: spring-boot项目freemarker模板使用jquery.pjax实现页面无刷新渲染
date: 2018-08-21 14:35:00
categories: spring-boot学习笔记
tags: spring-boot freemarker pjax
author: 朋也
---

* content
{:toc}

先看效果图

![](https://tomoya92.github.io/assets/freemarker-pjax.gif)

> pjax是啥，自行百度，关于它的兼容性可以看一下我另一篇博客：[https://tomoya92.github.io/2017/04/25/nodejs-pjax/](https://tomoya92.github.io/2017/04/25/nodejs-pjax/)






## 创建项目，引入文件

使用IDEA创建一个spring-boot项目，只需要 `web` `freemarker` 依赖就够了

引入 `jquery` `jquery.pjax` cdn可以使用 [https://www.bootcdn.cn/](https://www.bootcdn.cn/) 

## 定义controller

```java
@Controller
public class PjaxController {

  @GetMapping("/")
  public String index() {
    return "index";
  }

  @GetMapping("/book")
  public String book() {
    return "book";
  }

  @GetMapping("/computer")
  public String computer() {
    return "computer";
  }

  @GetMapping("/phone")
  public String phone() {
    return "phone";
  }

}
```

## 开发页面

说明：页面里的请求分两种：正常超链接、pjax请求，因为有两种，所以要开发两套layout布局

- 正常的layout里有网站用到的css, js等通用元素
- pjax的layout只是一个空布局文件，里面啥都没有

layout.ftl

```html
<#macro html>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://cdn.bootcss.com/jquery.pjax/2.0.1/jquery.pjax.min.js"></script>
  <title>Document</title>
  <style>
    html, body {
      margin: 0;
    }
  </style>
</head>
<body>
<header style="background-color: green; height: 50px; width: 100%;"></header>
<section>
  <nav style="float: left; width: 30%;background-color: bisque;">
    <ul>
      <li><a href="/">index</a></li>
      <li><a href="/book" data-pjax>book (pjax)</a></li>
      <li><a href="/computer" data-pjax>computer (pjax)</a></li>
      <li><a href="/phone" data-pjax>phone (pjax)</a></li>
    </ul>
  </nav>
  <div id="pjax-container" style="float: right; width: 70%; background-color: aliceblue;">
    <#nested />
  </div>
</section>
<footer style="clear: both;background-color: black; height: 50px; width: 100%;color: #fff; line-height: 50px;"></footer>
<script>
  $(document).pjax('[data-pjax] a, a[data-pjax]', '#pjax-container');
  var date = new Date();
  $("footer").html(
    date.getFullYear() + "-"
      + (date.getMonth() + 1)
      + "-" + date.getDay()
      + " " + date.getHours()
      + ":" + date.getMinutes()
      + ":" + date.getSeconds()
      + ":" + date.getMilliseconds()
  );
</script>
</body>
</html>
</#macro>
```

layout-pjax.ftl

```html
<#macro html>
  <#nested />
</#macro>
```

## 拦截器处理请求类型

```java
@Component
public class PjaxInterceptor implements HandlerInterceptor {

  private Logger logger = LoggerFactory.getLogger(PjaxInterceptor.class);

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    return true;
  }

  @Override
  public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
    Boolean pjax = Boolean.parseBoolean(request.getHeader("X-PJAX"));
    logger.info("is pjax: {}", pjax);
    if (pjax) {
      modelAndView.addObject("layoutName", "layout-pjax.ftl");
    } else {
      modelAndView.addObject("layoutName", "layout.ftl");
    }
  }

  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {

  }
}
```

然后配置拦截器拦截所有请求

```java
@Component
public class PjaxWebMvc extends WebMvcConfigurationSupport {

  @Autowired
  private PjaxInterceptor pjaxInterceptor;

  @Override
  protected void addInterceptors(InterceptorRegistry registry) {
    super.addInterceptors(registry);
    registry.addInterceptor(pjaxInterceptor)
        .addPathPatterns("/**");
  }
}
```

## 其它页面

说明：`<#include layoutName>` 里的 layoutName 就是从拦截器里设置的布局文件名

index.ftl

```html
<#include layoutName>
<@html>
  index page
</@html>
```

book.ftl

```html
<#include layoutName>
<@html>
  <p>this is a book</p>
</@html>
```

computer.ftl

```html
<#include layoutName>
<@html>
  <p>this is a computer</p>
</@html>
```

phone.ftl

```html
<#include layoutName>
<@html>
  <p>this is a phone</p>
</@html>
```

jquery.pjax 和 websocket 绝配呀，关于spring-boot里集成websocket的教程可以查看我另一篇博客 [https://tomoya92.github.io/2018/08/20/spring-boot-netty-socketio/](https://tomoya92.github.io/2018/08/20/spring-boot-netty-socketio/)
