---
layout: post
title: Gin学习笔记 - Validator(验证器)
date: 2021-02-24 13:24:00
categories: gin学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

gin里用的验证器是 https://github.com/go-playground/validator

配合着gin里提供的方法，用起来很方便

首先在实体类里定义好要进行什么验证，常用的有

- `required` 必填字段
- `email` 邮箱
- `url` 链接
- `min` 最小长度
- `max` 最大长度
- `lte` 小于等于(去掉e就是小于)
- `gte` 大于等于(去掉e就是大于)

更多验证规则可以去readme里查看 https://github.com/go-playground/validator/blob/master/README.md

修改前面写的 User 结构

```go
type User struct {
    Id       int      `json:"id" gorm:"primaryKey"`
    Name     string   `json:"name" binding:"required"`
    Password string   `json:"password" binding:"required,min=6,max=32"`
    Age      int      `json:"age" binding:"gte=1,lte=120"`
    Info     UserInfo `json:"info" gorm:"-" binding:"required"`
}

type UserInfo struct {
    Bio   string
    Email string `json:"email" binding:"required,email"`
}
```

可以看到，需要验证的字段，要用 binding 修饰，如果有多个验证规则，中间用英文逗号隔开

> 注意：这种验证只是针对请求参数的验证，不一定非要写在跟数据库映射关系的结构里，完全可以自定义一个 struct 来接收请求的参数然后制定验证规则
>
> 我这里是省事，就写到一块了

下面修改一下接收参数的写法，我这里以保存接口为例

```go
func SaveUser(c *gin.Context) {
    var user model.User
    // 使用 ShouldBind 方法实现字段与结构绑定且进行规则验证
    if err := c.ShouldBind(&user); err == nil {
        c.JSON(http.StatusOK, service.SaveUser(user.Name, user.Password, user.Age))
    } else {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    }
}
```

如果请求类型是 `application/json` 且参数是一段json字符串，则使用 `c.ShouldBindJson()` 方法来接收参数

相应的还有如下一些方法来绑定不同类型的请求参数

![](/assets/images/2021-02-24-14-43-52.png)

-----

自定义一个验证器

在util文件夹里创建一个验证器

```go
package util

import (
    "github.com/gin-gonic/gin/binding"
    "github.com/go-playground/validator/v10"
)

// 初始化时注册验证器
func init() {
    if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
        v.RegisterValidation("myValidator", myValidator)
    }
}

var myValidator validator.Func = func(fl validator.FieldLevel) bool {
    data := fl.Field().(string)
    return data == "ok"
}
```

这样就可以在结构里使用了，跟用 required, email 等验证器是一样的

```go
type User struct {
    Id       int    `json:"id" gorm:"primaryKey"`
    Name     string `json:"name" binding:"required,myValidator"` // 添加一个自定义的验证器，验证传的name值是否为ok，不为ok时就报错
    Password string `json:"password" binding:"required,min=6,max=32"`
    Age      int    `json:"age" binding:"gte=1,lte=120"`
}
```

![](/assets/images/2021-02-24-14-57-55.png)
