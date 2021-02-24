---
layout: post
title: Gin学习笔记 - Middleware(中间件)
date: 2021-02-24 15:59:00
categories: gin学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

gin里的中间件类似于Java里的拦截器（过滤器）可以对请求进行一些提前或者滞后的处理

创建一个日志的中间件

```go
package handler

import (
    "fmt"
    "github.com/gin-gonic/gin"
    "time"
)

func LoggerHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        t := time.Now()
        c.Next()
        latency := time.Since(t)
        fmt.Printf("PATH: %v | USE TIME: %v | RESPONSE STATUS: %d\n", c.Request.Method+c.FullPath(), latency, c.Writer.Status())
    }
}
```

用法，因为日志要拦截所有的请求，所以就配置在路由的最前面

```go
func main() {
    router := gin.Default()

    // 添加日志中间件
    router.Use(handler.LoggerHandler())

    router.GET("/users", controller.GetUsers)
    router.GET("/users/:name", controller.GetUser)
    router.POST("/users", controller.SaveUser)
    router.PUT("/users", controller.UpdateUser)
    router.DELETE("/users/:name", controller.DeleteUser)

    router.Run(":8080")
}
```

再定义一个验证token的中间件

```go
package handler

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func MyHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 获取header里的token值，没有话，就通过 c.Abort() 方法取消请求的继续进行，从而抛出异常
        if token := c.GetHeader("token"); token == "" {
            c.JSON(http.StatusForbidden, gin.H{"error": "token not found"})
            c.Abort()
        } else {
            // 让程序继续正常运行
            c.Next()
        }
    }
}
```

这种验证token的中间件一般都用在操作数据库里数据的时候，所以就不能放在所有路由最前面配置了

看一下 router.GET() 的源码

![](/assets/2021-02-24-15-53-40.png)

会发现这个函数最后一个参数是个可变参数，也就是说可以传多个 gin.HandlerFunc 对象，然后就可以将路由改造成下面这样

```go
func main() {
    router := gin.Default()

    router.Use(handler.LoggerHandler())

    router.GET("/users", controller.GetUsers)
    router.GET("/users/:name", controller.GetUser)
    router.POST("/users", handler.MyHandler(), controller.SaveUser)
    router.PUT("/users", handler.MyHandler(), controller.UpdateUser)
    router.DELETE("/users/:name", handler.MyHandler(), controller.DeleteUser)

    router.Run(":8080")
}
```

测试

请求 http://localhost:8080/users 就可以看到自己定义的日志信息了

![](/assets/2021-02-24-15-56-31.png)

当请求下面需要token的接口而没有传token时，就会被拦住

![](/assets/2021-02-24-15-58-16.png)
