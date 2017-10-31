---
layout: post
title: Java格式化Markdown文档的工具库commonmark-java
categories: spring-boot学习笔记
tags: markdown commonmark commonmark-java
author: 朋也
---

* content
{:toc}

之前在Java里格式化Markdown文档用的是`Pegdown`库，也挺好用的，不过还是没有`commommark-java`的可定制性强，下面对我使用`commonmark-java`做一下总结





## 引入依赖

commonmark-java的核心依赖是

```xml
<dependency>
  <groupId>com.atlassian.commonmark</groupId>
  <artifactId>commonmark</artifactId>
  <version>0.10.0</version>
</dependency>
```

它还有很多插件依赖，用到的话，也要引入，比如

自动将url格式的文本转成链接的插件

```xml
<dependency>
  <groupId>com.atlassian.commonmark</groupId>
  <artifactId>commonmark-ext-autolink</artifactId>
</dependency>
```

支持表格的插件

```xml
<dependency>
  <groupId>com.atlassian.commonmark</groupId>
  <artifactId>commonmark-ext-gfm-tables</artifactId>
</dependency>
```

支持删除线的插件

```xml
<dependency>
  <groupId>com.atlassian.commonmark</groupId>
  <artifactId>commonmark-ext-gfm-strikethrough</artifactId>
</dependency>
```

它们相应的版本请自行添加，跟核心依赖保持一致就可以了

## 使用

```java
import org.commonmark.node.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

Parser parser = Parser.builder().build();
Node document = parser.parse("This is *Sparta*");
HtmlRenderer renderer = HtmlRenderer.builder().build();
renderer.render(document);  // "<p>This is <em>Sparta</em></p>\n"
```

这是标准的格式化，如果想让它能自动链接，支持表格，删除线等，就要用到插件了

## 插件用法

```java
import org.commonmark.ext.gfm.tables.TablesExtension;

List<Extension> extensions = Arrays.asList(TablesExtension.create());
Parser parser = Parser.builder()
        .extensions(extensions)
        .build();
HtmlRenderer renderer = HtmlRenderer.builder()
        .extensions(extensions)
        .build();
```

注意上面 `Parser` 跟 `HtmlRenderer` 两个对象都要加载插件列表，亲测，如果HtmlRenderer没有加载插件列表，表格是不会出来的

加入插件格式化出来的文本也只是加上了 `<table>...</table>` 这样的一个标签而已，如果我想加上自己的样式怎么办呢？下面就要用到自定义渲染方法了

## 自定规则

```java
public String render(String content) {
  Parser parser = Parser.builder()
      .build();
  HtmlRenderer renderer = HtmlRenderer.builder()
      .attributeProviderFactory(context -> new HtmlAttributeProvider())
      .build();
  Node document = parser.parse(content);
  return renderer.render(document);
}

class HtmlAttributeProvider implements AttributeProvider {
  @Override
  public void setAttributes(Node node, String tagName, Map<String, String> attributes) {
    if (node instanceof TableBlock) { //判断是否是Table表格，是的话，加上css类样式 table table-bordered
      attributes.put("class", "table table-bordered");
    }
  }
}
```

这样渲染出来的表格就是下面这样了

```html
<table class="table table-bordered">
...
</table>
```

然后就可以定义自己的表格样式了，方便极了

## 一次回车换行

markdown语法有个比较不人性的地方(我个人认为不太友好)，就是写完一行要回车两次，它格式化出来的html文档才会有换行，如果只回车一次，它是不会换行的，这个就比较难受了，强大的`commonmark-java`也给出了解决办法

```java
HtmlRenderer renderer = HtmlRenderer.builder()
        .softbreak("<br/>") //这样设置就可以实现回车一次就换行
        .build();
```

## 参考

源码可见：[https://github.com/yiiu-co/yiiu/blob/master/src/main/java/co/yiiu/core/util/MarkdownUtil.java](https://github.com/yiiu-co/yiiu/blob/master/src/main/java/co/yiiu/core/util/MarkdownUtil.java)

- [https://github.com/atlassian/commonmark-java](https://github.com/atlassian/commonmark-java)
