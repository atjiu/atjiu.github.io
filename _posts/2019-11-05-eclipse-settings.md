---
layout: post
title: Eclipse配置，插件备忘
date: 2019-11-05 14:24:00
categories: 杂项
tags: eclipse
author: 朋也
---

* content
{:toc}

一直都用的是idea做的开发，突然想再换回eclipse用用，然后就开始了折腾，记录一下安装的插件和一些常用的配置

> 我这里用的是 spring tool suites 下载地址：https://spring.io/tools
>
> 系统 MacOS



## Eclipse界面字体大小

安装好之后，首先设置的就是字体了，网上找了很多，最靠谱的应该是直接改eclipse的启动配置文件了，找到sts的启动配置文件

`/Applications/SpringToolSuite4.app/Contents/Eclipse/SpringToolSuite4.ini`

将其中 `-Dorg.eclipse.swt.internal.carbon.smallFonts` 删除，或者在前面加上 `#` 注释掉，重启sts即可

## 保存自动格式化

![](/assets/images/QQ20191105-143124@2x.png)

然后再编辑java类的时候直接保存就会自动格式化了

但会有个问题，就是它把写的注释也给格式化了，怎么不让它格式化注释呢？如下图

在设置中搜索 `formatter` -> new一个新的配置 -> 找到comments，勾掉`Enable Javadoc comment formatting`

![](/assets/images/QQ20191105-143325@2x.png)

![](/assets/images/QQ20191105-143457@2x.png)

原接文链: [https://atjiu.github.io/2019/11/05/eclipse-settings/](https://atjiu.github.io/2019/11/05/eclipse-settings/)

## 自动提示

idea里非常好用的一个功能是自动提示功能，eclipse里默认只有当写 `@` `.` 的时候才会有提示，加上 `abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`

![](/assets/images/QQ20191105-143758@2x.png)

为啥没有小写的`s`呢？因为保存是 `cmd/ctrl+s` 如果加上s的话，每次保存它都会有提示，所以这就直接给去掉了

## Maven打包

网上找的教程一般都是直接运行 pom.xml 选择 Maven install，这种方式我不太喜欢，它会把当前项目安装到 `~/.m2/repository` 下，但又找不到 Maven package选项，怎么办？

在Maven项目的 pom.xml 里的build节点里加上下面这行配置，再运行 Maven compile就行了

```xml
<defaultGoal>package</defaultGoal>
```

![](/assets/images/QQ20191105-145200@2x.png)

## 插件

- [Eclipse Explorer: 在系统文件夹中打开](https://marketplace.eclipse.org/content/eclipse-explorer)
- [Freemarker IDE](https://marketplace.eclipse.org/content/freemarker-ide)
- [Thymeleaf Plugin for Eclipse](https://marketplace.eclipse.org/content/thymeleaf-plugin-eclipse)
- [Enhanced Class Decompiler: 反编译class文件](https://marketplace.eclipse.org/content/enhanced-class-decompiler)
- [MyBatipse: MyBatis插件](https://marketplace.eclipse.org/content/mybatipse)
