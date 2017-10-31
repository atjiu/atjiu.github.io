---
layout: post
title: markdown与asciidoc简单写法区别
date: 2017-03-19 12:15:20
categories: 杂项
tags: markdown asciidoc
author: 朋也
---

* content
{:toc}

最近看spring-projects/spring-boot的源码，里面的README用的是asciidoc语法写的，很好奇就学了一下，下面记录一下跟markdown的区别

## 标题

markdown

```
# -> h1
## -> h2
### -> h3
...
###### -> h6
```




asciidoc

```
= -> h1
== -> h2
=== -> h3
...
====== -> h6
```

## 引用

markdown

```
> 这是一段引用
```

asciidoc

```
[quote]
----
这是一段引用
----
```

## 链接

markdown

```
[tomoya's blog](https://tomoya92.github.io)
```

asciidoc

```
https:tomoya92.github.io[tomoya's blog]
```

## 图片

markdown

```
![图片alt](图片地址)
```

asciidoc

```
//一个:图片小的会直接在右边显示
image:图片地址[图片alt]
//两个:图片小的也会直接换行显示
image::图片地址[图片alt]
```

## 代码块

markdown

```
使用三个`包裹,标记语言类型直接在第一行三个`后面写上语言名
```

asciidoc

```
[code,java]
----
public class Hello {
  public static void main(String[] args) {
    System.out.println("hello world");
  }
}
----
```

## 粗体，斜体

markdown

```
**粗体**
*斜体*
```

asciidoc

```
*粗体*
_斜体_
```

## 列表

markdown & asciidoc 写法上一样

```
//无序列表
- tomcat
- jetty

//有序列表 
1. tomcat
2. jetty
```

## 表格

markdown

```
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| first | second| third |
```

asciidoc

```
|===
|first|second|third
|first|second|third
```

END