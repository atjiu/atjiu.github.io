---
layout: post
title: beego建站之上传文件
date: 2016-08-26 21:57:47
categories: Golang学习笔记
tags: Golang beego
author: 朋也
---

[beego官网](http://beego.me)
[beego上传官方文档](http://beego.me/docs/mvc/controller/params.md)

下面说说官方文档里没有说明的地方

上传代码

```go
func (c *FormController) Post() {
    f, h, err := c.GetFile("uploadname")
    defer f.Close()
    if err != nil {
        fmt.Println("getfile err ", err)
    } else {
        c.SaveToFile("uploadname", "/www/"+h.Filename)
    }
}
```




保存路径是 `"/www/"+h.Filename` 这上传到哪地方也不知道, 相对于项目文件夹的路径就让人容易明白的多了, 
我在[pybbs-go](https://github.com/tomoya92/pybbs-go/)里配置的上传文件夹是 `views/upload/avatar` 

具体代码

```go
func (c *UserController) UpdateAvatar() {
	flash := beego.NewFlash()
	f, h, err := c.GetFile("avatar")
	defer f.Close()
	if err != nil {
		flash.Error("上传失败")
		flash.Store(&c.Controller)
		c.Redirect("/user/setting", 302)
		return
	} else {
		c.SaveToFile("avatar", "static/upload/avatar/" + h.Filename)
		_, user := filters.IsLogin(c.Ctx)
		user.Avatar = "/static/upload/avatar/" + h.Filename
		models.UpdateUser(&user)
		flash.Success("上传成功")
		flash.Store(&c.Controller)
		c.Redirect("/user/setting", 302)
	}
}
```

**注意, 要事先新建好对于的文件夹**
