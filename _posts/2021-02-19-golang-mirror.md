---
layout: post
title: golang国内镜像
date: 2021-02-19 13:40:00
categories: golang学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

用 `go get` 下载框架或者依赖会相当的慢，特别是碰到`golang.org/x`这里的依赖。配置一下go的国内镜像下载速度就上来了

```
# 启用 Go Modules 功能
go env -w GO111MODULE=on

# 配置 GOPROXY 环境变量，以下三选一

# 1. 七牛 CDN
go env -w  GOPROXY=https://goproxy.cn,direct

# 2. 阿里云
go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct

# 3. 官方
go env -w  GOPROXY=https://goproxy.io,direct

————————————————
原文作者：Summer
转自链接：https://learnku.com/go/wikis/38122
```

亲测，速度立即就上来了，我只运行了 `go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct` 这一条命令