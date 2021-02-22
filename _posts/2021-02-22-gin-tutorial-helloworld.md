---
layout: post
title: Gin学习笔记 - HelloWorld
date: 2021-02-22 11:06:00
categories: gin学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

好几年前用beego写了个pybbs-go，然后就把go扔了，现在想重新捡起来，试试看挺火的gin框架






首先创建一个文件夹 `gin-tutorial` 这就是项目了

进入文件夹，运行 `go mod init` 初始化项目

初始化完成后，文件夹下会多出一个 `go.mod` 文件，内容如下

```
module gin-tutorial

go 1.16
```

新建一个 `main.go`编写上以下代码

```go
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

// 定义一个结构体，用于返回json格式内容的测试
type Demo struct {
    Field1 string `json:"field1"`
    Field2 string `json:"field2"`
}

func main() {
    router := gin.Default()
    // 如果要输出模板文件，下面这行一定要定义
    router.LoadHTMLGlob("templates/*")
    router.GET("/", func(c *gin.Context) {
        // 输出字符串
        c.String(http.StatusOK, "hello world")
        // 输出json
        //c.JSON(200, Demo{Field1: "abc", Field2: "def"})
        // 输出模板文件
        //c.HTML(http.StatusOK, "index.html", gin.H{})
        // 输出资源文件 这个文件在当前目录下的 static 文件夹下
        //c.File("./static/avatar.jpg")
    })
    router.Run(":8080")
}
```

这里用到了 `github.com/gin-gonic/gin` 依赖，在终端里运行 `go mod tidy` 然后这个依赖会自动的被加入到 `go.mod` 文件里并带上最新的版本号

```
module gin-tutorial

go 1.16

require github.com/gin-gonic/gin v1.6.3
```

最后运行 `go run main.go` 并浏览器访问：http://localhost:8080/

如果启动不起来且用的IDE是goland的话，可以尝试打开 settings -> Go -> Go Modules 将 `Enable Go modules integration` 给打开

同时配置一下Environment里的GoProxy的话，以后再下载依赖应该会更快

![](/assets/2021-02-22-11-53-22.png)
