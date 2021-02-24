---
layout: post
title: Gin学习笔记 - MVC & CRUD
date: 2021-02-22 15:04:00
categories: gin学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

上古的分包模型，M模型，V视图，C控制器

对应到项目中的包结构如下

```
gin-tutorial
├─controller
├─model
├─service
└─main.go
```

创建model.User

```go
type User struct {
    Name     string `json:"name"`
    Password string `json:"password"`
    Age      int    `json:"age"`
}
```

创建UserService，作为user的服务层，后面这个类都是要跟数据库打交道的，现在还没有连接数据库，临时造点假数据

```go
package service

import (
    "gin-tutorial/model"
    uuid "github.com/satori/go.uuid"
    "strconv"
)

type UserService struct {
    users []model.User
}

func (service *UserService) Init() {
    for i := 0; i < 10; i++ {
        service.users = append(service.users, model.User{
            Name:     "name" + strconv.Itoa(i),
            Password: uuid.NewV4().String(),
            Age:      i + 10,
        })
    }
}
```

然后在UserService里添加上CRUD的方法

```go

func (service *UserService) GetUsers() []model.User {
    return service.users
}

func (service *UserService) GetByName(name string) model.User {
    for i := range service.users {
        user := &service.users[i]
        if user.Name == name {
            return *user
        }
    }
    return model.User{}
}

func (service *UserService) SaveUser(name string, password string, age int) model.User {
    newUser := model.User{
        Name:     name,
        Password: password,
        Age:      age,
    }
    service.users = append(service.users, newUser)
    return newUser
}

func (service *UserService) UpdateUserByName(name string, password string, age int) model.User {
    for i := range service.users {
        user := &service.users[i]
        if user.Name == name {
            user.Password = password
            user.Age = age
            return *user
        }
    }
    return model.User{}
}

func (service *UserService) DeleteUserByName(name string) {
    for i, user := range service.users {
        if user.Name == name {
            service.users = append(service.users[:i], service.users[i+1:]...)
        }
    }
}
```

service弄好后，下面创建controller

UserController里要用到UserService里的方法，所以在UserController里定义一个UserService的对象

```go
package controller

import (
    "gin-tutorial/service"
    "github.com/gin-gonic/gin"
    "net/http"
    "strconv"
    "unsafe"
)

type UserController struct {
    Service *service.UserService
}
```

添加上CRUD的入口，每个方法就一个参数 `c *gin.Context` 这样就能作为路由方法了

```go
func (controller UserController) GetUsers(c *gin.Context) {
    c.JSON(http.StatusOK, controller.Service.GetUsers())
}

func (controller UserController) GetUser(c *gin.Context) {
    name := c.Param("name")
    c.JSON(http.StatusOK, controller.Service.GetByName(name))
}

func (controller UserController) SaveUser(c *gin.Context) {
    // 获取post请求的参数，请求类型必须要是 application/x-www-form-urlencoded
    name := c.PostForm("name")
    password := c.PostForm("password")
    age, _ := strconv.ParseInt(c.PostForm("age"), 10, 32)
    c.JSON(http.StatusOK, controller.Service.SaveUser(name, password, *(*int)(unsafe.Pointer(&age))))
}

func (controller UserController) UpdateUser(c *gin.Context) {
    name := c.PostForm("name")
    password := c.PostForm("password")
    age, _ := strconv.ParseInt(c.PostForm("age"), 10, 64)
    c.JSON(http.StatusOK, controller.Service.UpdateUserByName(name, password, *(*int)(unsafe.Pointer(&age))))
}

func (controller UserController) DeleteUser(c *gin.Context) {
    name := c.Param("name")
    controller.Service.DeleteUserByName(name)
    c.JSON(http.StatusOK, controller.Service.GetUsers())
}
```

几种取值的方式

- ?name=123&pwd=abc  这种是Query参数，使用 c.Query("name") 来取
- /users/:name  这是Param参数，使用 c.Param("name") 来取
- POST请求且Content-Type为application/x-www-form-urlencoded 时，使用 c.PostForm("name") 来取
- 请求类型为 application/json 且参数是一段json字符串时（如下图），可以使用 c.BindJson()方法来取

![](/assets/2021-02-24-14-43-03.png)

最后修改main.go里的路由配置

```go
package main

import (
    "gin-tutorial/controller"
    "gin-tutorial/service"
    "github.com/gin-gonic/gin"
)

// 初始化service和controller
var userService = service.UserService{}
var userController = controller.UserController{Service: &userService}

func main() {
    router := gin.Default()
    // router.LoadHTMLGlob("templates/*")

    // 初始化造的假数据
    userService.Init()

    router.GET("/users", userController.GetUsers)
    router.GET("/users/:name", userController.GetUser)
    router.POST("/users", userController.SaveUser)
    router.PUT("/users", userController.UpdateUser)
    router.DELETE("/users/:name", userController.DeleteUser)

    router.Run(":8080")
}
```

--------------------

string 转 int/int32/int64 或者 int 转 string 的方法

![](/assets/2021-02-22-15-40-48.png)