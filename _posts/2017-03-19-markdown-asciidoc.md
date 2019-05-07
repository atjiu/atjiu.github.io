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

> pybbs文档已经完全换成 asciidoc 编写了, 生成的文档风格跟 spring 官网的文档风格一样

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
[source,java]
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

多级列表

markdown

```
- li
- li
    - li
- li
```

asciidoc

```
- li
- li
** li # 二级
*** li # 三级
- li
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
|===

# 如果中间空一格, 上面那块就会渲染成表头th

|===
| header1 | header2

| first | second
| first | second
|===
```

## 警告图标

这个是asciidoc里自带的, markdown里没有这功能

写一段文档, 在文档上面加上 `[WARNING]` 渲染出来的文档就会有一个图标

```
[WARNING]
如果要自己打包，可使用命令：mvn clean assembly:assembly 进行打包，不要尝试使用其它方式打包
```

上面内容在asciidoc渲染出来后, 如下图所示

![](/assets/QQ20190507-104546.png)

这种提示的图标共有 `TIP` `NOTE` `IMPORTANT` `WARNING` `CAUTION` 这么几种

END
