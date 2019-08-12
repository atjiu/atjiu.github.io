---
layout: post
title: Flutter环境搭建以及创建项目在vscode里开发并启动以及热加载
date: 2019-07-16 14:14:00
categories: flutter学习笔记
tags: flutter
author: 朋也
---

* content
{:toc}

一直都想学一下flutter的，今天正式开始






## 安装

到官网上下载对应平台的sdk，然后安装好配置好环境变量 链接：[https://flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)

安装好之后，运行 `flutter doctor` 查看一下ide和一些工具依赖是否安装成功

## IDE

上一步配置好环境变量后，运行 `flutter doctor` ，如果电脑上已经安装了 vscode ，那么它会提示你安装相应的插件，按照它的提示安装好即可

我这用的ide就是 `vscode` ，后面如果涉及到打包，可能会用到 `xcode` 或者 `android studio`

## 创建项目

运行命令

```bash
flutter create hello_world
```

文原接链: [https://tomoya92.github.io/2019/07/16/flutter-helloworld/](https://tomoya92.github.io/2019/07/16/flutter-helloworld/)

这里的项目名不能以 `-` 相连，因为项目名在创建的时候会作为项目的包名

创建好之后，使用 vscode 打开，有两种启动方式

1. 在vscode终端里运行`flutter run`
2. 在vscode里打开debug，创建一个启动文件，使用debug的模式启动

**注意，在启动之前，要先启动一个模拟器，我用的是 mac 启动模拟器命令是 `open -a Simulator`**

> 如果平台是 windows 或者想启动一个 android模拟器，可以打开 Android studio 启动，也可以使用一些安卓游戏模拟器

## 问题

我在启动的过程中碰到了一些问题

- 使用 `flutter run` 命令启动时，在启动成功后，它不会出现 `sync file...` 这样的提示，这也就导致了如果文件有更新，没法按 `r` 自动加载

> 解决办法：在运行 `flutter run` 命令的终端里配置一下代理信息 `export NO_PROXY=localhost,127.0.0.1` 如果有http代理，同样配置上即可

- 使用 debug 模式启动，模拟器里一直是白屏

> 先更新一下 flutter 版本， 然后重启vscode，再次启动，如果有提示要开启 `dart: open devtools` 则同意，提示是否要激活 `devtools` 也选择同意，这样就可以启动成功了，当修改代码后，什么都不用点，它就会自动的去重新加载
>
> 开发神器，大赞！

## 参考

- [https://flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)
