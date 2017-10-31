---
layout: post
title: spring-boot里用freemarker做模板的国际化配置
date: 2017-02-18 19:37:20
categories: spring-boot学习笔记
tags: spring-boot freemarker i18n
author: 朋也
---

* content
{:toc}

网上搜索到的都是用thymeleaf模板做的国际化，没找到freemarker，然后我想到了，spring-boot 用的mvc框架不就是springmvc吗，然后就搜索了下springmvc freemarker i18n，结果还真让我找到了

## 配置application.yml

```yml
spring:
  messages:
    basename: i18n/messages
```

## 新建文件

在src/main/resources下新建文件夹i18n

在i18n文件夹里创建文件messages.properties、messages_en_US.properties




当找不到语言的时候就会用messages.properties里的配置

将`org.springframework.web.servlet.view.freemarker.spring.ftl`复制到resources下

配置application.yml文件

```yml
spring:
  freemarker:
    settings:
      auto_import: /spring.ftl as spring
```

## 设置语言区域

如果没手动设置，spring-boot会自动找浏览器的语言，下面说说怎么手动设置

在Application.java里添加下面代码即可

```java
@Bean
public LocaleResolver localeResolver() {
    SessionLocaleResolver slr = new SessionLocaleResolver();
    slr.setDefaultLocale(Locale.US);
    return slr;
}
```

如果想通过浏览器里的选项来改变语言，可以通过下面controller来设置

```java
@GetMapping("changeLanguage")
public String changeLanguage(String lang, HttpSession session, HttpServletResponse response) {
    if ("zh".equals(lang)) {
        session.setAttribute(SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME, new Locale("zh", "CN"));
    } else if ("en".equals(lang)) {
        session.setAttribute(SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME, new Locale("en", "US"));
    }
    return redirect(response, "/");
}
```

如果想在java代码里获取当前的语言，可以用这个工具 [LocaleMessageSourceUtil.java](https://github.com/zl736732419/spring-boot-i18n/blob/master/src/main/java/com/zheng/utils/LocaleMessageSourceUtil.java)

```java
@Autowired
private LocaleMessageSourceUtil localeMessageSourceUtil;

public void foo() {
    String xxx = localeMessageSourceUtil.getMessage("xxx");
    System.out.println(xxx);
}
```

参考代码：http://github.com/tomoya92/pybbs 里i18n相关代码
