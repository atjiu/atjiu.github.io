---
layout: post
title: thymeleaf模板属性的用法(更新:增加了if, each, 取值用法介绍)
date: 2017-03-09 15:34:20
categories: spring-boot学习笔记
tags: thymeleaf attribute
author: 朋也
---

* content
{:toc}

下面说到的在thymeleaf官网上都可以找到，这里只做个总结

> 2019-04-21 更新

新增一些用法

## 取值

```java
@GetMapping("/")
public String index(Model model) {
    model.addAttribute("name", "hello thymeleaf");
    return "index";
}
```

使用 `th:text` 属性展示数据

```html
<div th:text="#{name}"></div>
<div th:text="${name}"></div>
<div>[[${name}]]</div>
```

区别:





- #{name} 获取的是国际化的数据
- ${name} 获取controller里设置在Model里的数据
- [[${name}]] 与${name}效果一样,只不过这种方式是写在标签内容里的,${name} 是写在标签属性里

## for循环

在controller里设置在Model里一个List数据,然后在thymeleaf里循环取出来展示在页面上

```java
@GetMapping("/")
public String index(Model model) {
    List<String> list = Arrays.asList("Spring", "Java", "NodeJS", "Python");
    model.addAttribute("list", list);
    return "index";
}
```

使用 `th:each` 属性循环数据

```html
<div th:each="lang: ${list}">
  <div th:text="${lang}"></div>
</div>
```

值得一说的是, 循环时还有一个变量,可以取一些有用的数据

```html
<div th:each="lang, istat: ${list}">
  <div th:text="${istat.index}"></div> <!-- 获取循环下标,从0开始 -->
  <div th:text="${lang}"></div>
</div>
```

链原文接: [https://tomoya92.github.io/2017/03/09/spring-boot-thymeleaf-attribute/](https://tomoya92.github.io/2017/03/09/spring-boot-thymeleaf-attribute/)

istat里还可以取出下面这些属性

- index      当前循环的下标,从0开始
- count      循环到当前状态下的总条数
- size       list里的总条数
- even/odd   even是偶数条数,odd是奇数条数,这个属性可以实现隔行换色等需求
- first      是否是第一条数据
- last       是否是最后一条数据

## 逻辑判断

有两种方式可以解决if else展示不同数据

- `th:if` `th:unless`
- `th:switch` `th:case`

下面来看一下例子

```java
@GetMapping("/")
public String index(Model model) {
    model.addAttribute("flag1", true);
    model.addAttribute("flag2", null);
    return "index";
}
```

```html
<div th:if="${flag1}">show this when flag1 is true.</div>
<div th:unless="${flag1}">show this when flag1 is false.</div>

<div th:switch="${flag2}">
  <div th:case="${true}">show this when flag2 is true.</div>
  <div th:case="${false}">show this when flag2 is false.</div>
  <div th:case="*">flag2 != true and flag2 != false</div>
</div>
```

其实 `th:unless`可以看成是`else`的意思

## 循环map

```java
@GetMapping("/")
public String index(Model model) {
    Map user = new HashMap();
    user.put("name", "tomcat");
    user.put("age", 20);
    user.put("address", "Shanghai");
    model.addAttribute("user", user);
    return "index";
}
```

``html
<div th:each="user: ${user}">[[${user.key}]] - [[${user.value}]]</div>
```

跟循环list一样,循环map也可以获取到当前的循环状态

``html
<div th:each="user, istat: ${user}">[[${user.key}]] - [[${user.value}]] - [[${istat.index}]]</div>
```

----

## thymeleaf模板里用spring-security的tags

官网链接 [http://www.thymeleaf.org/doc/articles/springsecurity.html](http://www.thymeleaf.org/doc/articles/springsecurity.html)

**注意** 没有hasPermission()方法，在pom.xml里要引入

文链原接: [https://tomoya92.github.io/2017/03/09/spring-boot-thymeleaf-attribute/](https://tomoya92.github.io/2017/03/09/spring-boot-thymeleaf-attribute/)

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
