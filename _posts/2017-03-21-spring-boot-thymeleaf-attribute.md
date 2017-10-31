---
layout: post
title: thymeleaf模板属性的用法
date: 2017-03-09 15:34:20
categories: spring-boot学习笔记
tags: thymeleaf attribute
author: 朋也
---

* content
{:toc}

下面说到的在thymeleaf官网上都可以找到，这里只做个总结

## thymeleaf模板里用spring-security的tags

官网链接 [http://www.thymeleaf.org/doc/articles/springsecurity.html](http://www.thymeleaf.org/doc/articles/springsecurity.html)

**注意** 没有hasPermission()方法，在pom.xml里要引入

```xml
<dependency>
    <groupId>org.thymeleaf.extras</groupId>
    <artifactId>thymeleaf-extras-springsecurity4</artifactId>
</dependency>
```




## html页面写script

```html
<script th:inline="javascript">
    /*<![CDATA[*/
    function notificationCount() {
        $.ajax({
            url: "/api/notification/notRead",
            async: true,
            cache: false,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.code == 200 && data.detail > 0) {
                    $("#badge").text(data.detail);
                }
            }
        });
    }
    notificationCount();
    setInterval(function () {
        notificationCount();
    }, 120000);
    /*]]>*/
</script>
```

## 动态生成restful风格的url

```html
<a th:href="@{/topic/__${topic.id}__}" th:text="${topic.title}"></a>
//<a href="/topic/1">hello world<a>
```

query风格的url

```html
<a th:href="@{/topic/(id=${topic.id})}" th:text="${topic.title}"></a>
//<a href="/topic?id=1">hello world<a>
```

## 页面动态增减class样式

```html
<div th:class="${isActive} ? 'active'"></div>
//如果isActive是true，渲染出
//<div class="active"></div>
```

## 调用实体类里的方法并传值

```html
//调用属性
<span th:text="${user.name}"></span>

//调用方法
<span th:text="${user.getName()}"><span>

//给方法传值
<span th:text="${user.formatDate(user.inTime)}}"></span>

//其实跟velocity, freemarker的用法是一样的，我最开始受th:href="@{/user/(name=${user.name})}"的影响，给弄错了，还以为不支持呢。。
```

## 写入行间属性

```html
<span th:attr="data-id=${user.id}"></span>
//<span data-id="1"></span>
```

END
