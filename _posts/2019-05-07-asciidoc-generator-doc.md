---
layout: post
title: 使用asciidoc生成spring官网风格的文档
date: 2019-05-07 11:00:00
categories: 杂项
tags: asciidoc
author: 朋也
---

* content
{:toc}

spring官方文档看了多少年, 不知道人家是怎么写出来的, 前一段时间折腾 undertow 这个小容器, 又看到了跟spring文档一样风格的文档, 好奇心作祟, 然后就折腾了一下

不折腾不要紧, 折腾后, 顺便把pybbs的整个文档给换了

> 我挺喜欢这种风格的, 不知道为啥, 好多人都说不好看

给张图先瞅瞅

![](/assets/images/undertow-doc-snapshot.png)






先说一下我折腾的方法

找到undertow官方文档的开源地址, 把源码下载下来, 删删减减, 然后大致就知道怎么个回事了, 下面来说一下用法

## 创建项目

创建一个maven, 最简单的maven项目就可以, 删除src/main里的 resources 和 java 两个文件夹以及 test文件夹

在 pom.xml 文件里加上下面两个插件

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.asciidoctor</groupId>
      <artifactId>asciidoctor-maven-plugin</artifactId>
      <version>1.5.2</version>
      <executions>
        <execution>
          <id>output-html</id>
          <phase>generate-resources</phase>
          <goals>
            <goal>process-asciidoc</goal>
          </goals>
          <configuration>
            <backend>html5</backend>
            <sourceHighlighter>coderay</sourceHighlighter>
            <attributes>
              <imagesdir>./images</imagesdir>
              <icons>font</icons>
              <sectanchors>true</sectanchors>
              <!-- set the idprefix to blank -->
              <idprefix/>
              <idseparator>-</idseparator>
              <docinfo1>true</docinfo1>
            </attributes>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-assembly-plugin</artifactId>
      <executions>
        <execution>
          <id>assemble</id>
          <phase>package</phase>
          <goals>
            <goal>single</goal>
          </goals>
          <configuration>
            <descriptors>
              <descriptor>assembly.xml</descriptor>
            </descriptors>
            <!--<recompressZippedFiles>true</recompressZippedFiles>-->
            <finalName>undertow-docs-${project.version}</finalName>
            <appendAssemblyId>false</appendAssemblyId>
            <outputDirectory>target/</outputDirectory>
            <workDirectory>target/assembly/work</workDirectory>
            <tarLongFileMode>gnu</tarLongFileMode>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

## 编写文档

不知道asciidoc文档怎么写的, 可以查看我另一篇博客 [markdown与asciidoc简单写法区别](https://atjiu.github.io/2017/03/19/markdown-asciidoc/)

在 `src/main/` 下创建一个文件夹 `asciidoc` 然后在这个文件夹里再创建一个文件 `index.asciidoc` 必须要是这个名字

全路径长这个样 `src/main/asciidoc/index.asciidoc`

另外再创建一个文件, 这个文件名字就可以随便起了, 比如 `introduction.asciidoc`

编写时要注意规范了

---

首先先写 `introduction.asciidoc` 里的内容, 在文档前后加上如下内容

```
// tag::main[]

这里是写内容的

// end::main[]
```

后面增加的文档里每一篇都要加上开头跟结尾这两句

原链接文：[https://atjiu.github.io/2019/05/07/asciidoc-generator-doc/](https://atjiu.github.io/2019/05/07/asciidoc-generator-doc/)

---

其次是 `index.asciidoc` 文档的编写

格式如下

```
朋也社区文档
=====
朋也社区文档
:Author:    朋也
:Email:     <py2qiuse@gmail.com>
:Date:      2019
:Revision:  1.0
:doctype: book
:revdate: {docdate}
:sectanchors:
:xrefstyle: full
:anchor:
:toc: left
:toclevels: 3
:sectnumlevels: 5

== 简介

include::introduction.asciidoc[tags=main]

== 快速开始

== 接口文档

== Q&A

```

第一行是文档生成后的网页title, 下面的内容不用说了吧, 看前面名字意思就知道是啥了

可以看到在 `index.asciidoc` 里引入其它文档的写法是这样的 `include::introduction.asciidoc[tags=main]`

写法是固定的, 只需要更换文档的文件名就可以了, 前面, 后面的写法都不要动它就对了

## 生成文档

在终端里运行命令 `mvn clean compile` 即可构建项目然后生成文档, 文档生成地址在 `./target/generated-docs/` 下, 浏览器打开里面的 `index.html` 文件就看到效果了

在开发过程中, 可以使用命令 `mvn asciidoctor:http` 提前启动一个http服务, 端口监听在 2000 , 浏览器直接访问 http://localhost:2000/ 即可访问

**开发好, 想看效果, 要首先运行一下命令 `mvn compile` 构建一下**

## 打包

可以看到上面配置插件的时候, 还额外配置了一下 `assembly` 插件, 这货主要是打包用的, 它可以把 `target/generated-docs` 文件夹打包成 zip 包重命名

先在项目根目录下创建一个文件 `assembly.xml` 内容如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<assembly xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.2 http://maven.apache.org/xsd/assembly-1.1.2.xsd">
    <id>pybbs-docs</id>
    <formats>
       <format>zip</format>
    </formats>
    <includeBaseDirectory>true</includeBaseDirectory>
    <fileSets>
        <fileSet>
            <directory>target/generated-docs</directory>
            <outputDirectory/>
        </fileSet>
        <fileSet>
            <outputDirectory>images</outputDirectory>
        </fileSet>
    </fileSets>
</assembly>
```

可对内容进行适当的修改

想打包的话, 运行命令 `mvn assembly:assembly` 即可

## 文档图片

有时候写文档可能会加入一些图片, 具体做法如下

在 `src/main/asciidoc/` 下创建一个文件夹 `images` 然后把图片文档都放在这个里面

文档里使用图片方法如下, 假如 `images` 文件夹里已经有了一个图片, 名字是 `test.png`

```
image:test.png[]
```

**注意**: 图片前不要带上 `images` , 这货生成文件的时候好像会自动带上

## 参考

- [https://github.com/undertow-io/undertow-docs](https://github.com/undertow-io/undertow-docs)
