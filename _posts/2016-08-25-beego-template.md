---
layout: post
title: beego建站之模板
date: 2016-08-25 08:09:57
categories: Golang学习笔记
tags: Golang beego
author: 朋也
---

* content
{:toc}

[beego官网](http://beego.me)
beego作为一个golang的web框架，入门非常的简单，既然要开发网站就少不了视图模板

官方文档：http://beego.me/docs/mvc/view/tutorial.md

## 模板里取值方式

假如后台输出了一个字符串`PageTitle`




```go
//登录页
func (c *IndexController) LoginPage() {
  c.Data["PageTitle"] = "登录"
  c.Layout = "layout/layout.tpl"
  c.TplName = "login.tpl"
}
```

在模板里取值方法：

```html
{{.PageTitle}}
```

**前面要带上 . 很奇怪的取值方式，具体啥原因，我也不知道，会用就好 ：）**

## 模板布局

一个网站肯定会共用 头，尾 部分，所以模板支持布局是很重要的，下面说说布局该怎么用

进入登录页面的路由

```go
//登录页
func (c *IndexController) LoginPage() {
  c.Data["PageTitle"] = "登录"
  c.Layout = "layout/layout.tpl"
  c.TplName = "login.tpl"
}
```

路由里设置了 `c.Layout = "layout/layout.tpl"` 然后设置了模板名称 `c.TplName = "login.tpl"`

下面就是在views文件夹里创建layout文件夹，并创建layout.tpl文件

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{.PageTitle}}</title>
  <link rel="stylesheet" href="/static/bootstrap/css/bootstrap.min.css"/>
  <link rel="stylesheet" href="/static/css/pybbs.css">
  <script src="//cdn.bootcss.com/jquery/2.2.2/jquery.min.js"></script>
  <script src="//cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
</head>
<body>
  <div class="container">
    {{.LayoutContent}}
  </div>
</body>
</html>
```

然后在views文件夹里创建login.tpl文件

```html
<div class="row">
  <div class="col-md-6">
    <div class="panel panel-default">
      <div class="panel-heading">登录</div>
      <div class="panel-body">
        {{template "components/flash_error.tpl" .}}
        <form action="/login" method="post">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" name="username" class="form-control" placeholder="用户名">
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" name="password" class="form-control" placeholder="密码">
          </div>
          <input type="submit" class="btn btn-default" value="登录"> <a href="/register">去注册</a>
        </form>
      </div>
    </div>
  </div>
</div>
```

**注意：layout.tpl里的`LayoutContent`是固定写法，目的是将tplName设置的页面渲染的位置**

![2016-08-25 07-56-43屏幕截图.png](https://oceovtl1w.qnssl.com/2016-08-25 07-56-43屏幕截图.png)

## 模板的引用

在开发网站的时候，有时候会出现几个页面的某一部分都是一样的，这时候可以将其提取出来，然后使用模板函数 `template` 引入要使用的模板，如果需要传值的话，只需要在末尾加上 `.` 就可以了

比如,我在views文件夹里创建文件夹components，然后新建welcome.tpl文件

```html
<div class="panel panel-default">
  <div class="panel-body">
    <h5>更好用的GO语言的bbs</h5>
    <p>在这里，您可以提问，回答，分享，诉说，这是个属于GO程序员的社区，欢迎您的加入！</p>
  </div>
</div>
```

然后在首页页面里引入

```html
  {{template "components/welcome.tpl" .}}
```

效果

![2016-08-25 08-02-20屏幕截图.png](https://oceovtl1w.qnssl.com/2016-08-25 08-02-20屏幕截图.png)

## 模板函数

最后还是说说模板函数吧

用的最多的就是 `if` `range`

if用法

```html
<div class="col-md-3 hidden-sm hidden-xs">
  {{if .IsLogin}}
    {{template "components/user_info.tpl" .}}
    {{template "components/topic_create.tpl" .}}
  {{else}}
    {{template "components/welcome.tpl" .}}
  {{end}}
</div>
```

range (也就是for循环) 用法

```html
<select name="sid" id="sid" class="form-control">
  {{range .Sections}}
    <option value="{{.Id}}">{{.Name}}</option>
  {{end}}
</select>
```

## 自定义模板函数

对着官方文档来就可以成功，没有什么需要注意的，下面给个例子

```go
package utils

import (
    "time"
    "github.com/xeonx/timeago"
    "github.com/astaxie/beego"
)

func FormatTime(time time.Time) string {
  return timeago.Chinese.Format(time)
}

func init() {
  beego.AddFuncMap("timeago", FormatTime)
}
```

页面使用方法

```html
<span>{{.InTime | timeago}}</span>
```
