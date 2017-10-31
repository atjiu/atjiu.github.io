---
layout: post
title: beego建站之上传文件权限设计
date: 2016-08-26 22:39:01
categories: Golang学习笔记
tags: Golang beego
author: 朋也
---

* content
{:toc}

[beego官网](http://beego.me)

[pybbs-go](https://github.com/tomoya92/pybbs-go/) 里的权限设计异常的简单

共设计3张表, 两两都是多对多关联, 会产生2张中间表, 一共是5张表

## 结构




```go
//User
type User struct {
	Id        int `orm:"pk;auto"`
	Username  string `orm:"unique"`
	Password  string
	Token     string `orm:"unique"`
	Avatar    string
	Email     string `orm:"null"`
	Url       string `orm:"null"`
	Signature string `orm:"null;size(1000)"`
	InTime    time.Time `orm:"auto_now_add;type(datetime)"`
	Roles     []*Role `orm:"rel(m2m)"`
}
```
```go
//Role
type Role struct {
    Id          int `orm:"pk;auto"`
    Name        string `orm:"unique"`
    Users       []*User `orm:"reverse(many)"`
    Permissions []*Permission `orm:"rel(m2m)"`
}
```
```go
//User
type Permission struct {
    Id          int `orm:"pk;auto"`
    Pid         int
    Url         string
    Name        string
    Description string
    Roles       []*Role `orm:"reverse(many)"`
    ChildPermissions []*Permission `orm:"-"`
}
```

使用beego的orm框架自动生成了5张表,分别是 `user` `role` `user_roles` `permission` `role_permissions` 

本来想用orm自动来维护多对多的关联关系, 结果发现不行, 貌似没实现, 只好自己写sql

## 逻辑处理

在用户界面列表界面可以通过配置角色给用户勾选角色,具体代码

```go
func (c *UserController) Update() {
    c.Data["PageTitle"] = "配置角色"
    c.Data["IsLogin"], c.Data["UserInfo"] = filters.IsLogin(c.Ctx)
    id, _ := strconv.Atoi(c.Ctx.Input.Param(":id"))
    roleIds := c.GetStrings("roleIds")
    if id > 0 {
        models.DeleteUserRolesByUserId(id)
        for _, v := range roleIds {
            roleId, _ := strconv.Atoi(v)
            models.SaveUserRole(id, roleId)
        }
        c.Redirect("/user/list", 302)
    } else {
        c.Ctx.WriteString("用户不存在")
    }
}
```

![qq20160826-1 2x](https://cloud.githubusercontent.com/assets/6915570/18008074/4e87322a-6bd9-11e6-9bd5-bab182846204.png)

创建/编辑角色,可以为角色勾选上应有的权限

```go
func (c *RoleController) Save() {
    flash := beego.NewFlash()
    name, permissionIds := c.GetString("name"), c.GetStrings("permissionIds")
    if len(name) == 0 {
        flash.Error("角色名称不能为空")
        flash.Store(&c.Controller)
        c.Redirect("/role/add", 302)
    } else {
        role := models.Role{Name: name}
        id := models.SaveRole(&role)
        role_id, _ := strconv.Atoi(strconv.FormatInt(id, 10))
        for _, pid := range permissionIds {
            _pid, _ := strconv.Atoi(pid)
            models.SaveRolePermission(role_id, _pid)
        }
        c.Redirect("/role/list", 302)
    }
}
```

![qq20160826-3 2x](https://cloud.githubusercontent.com/assets/6915570/18008073/4e86cae2-6bd9-11e6-9208-bdcb371424d8.png)

**当删除角色/权限的时候,要将role_permissions里的对应关系也删除掉, 同理删除用户/角色的时候也要删除user_roles里的对应关系**

在权限里配置授权地址, 然后通过过滤器来拦截请求进行判断是否具备访问权限

![qq20160826-4 2x](https://cloud.githubusercontent.com/assets/6915570/18008075/4e917046-6bd9-11e6-9c43-322c85751d67.png)

## 访问验证

过滤器

```go
func IsLogin(ctx *context.Context) (bool, models.User) {
    token, flag := ctx.GetSecureCookie(beego.AppConfig.String("cookie.secure"), beego.AppConfig.String("cookie.token"))
    var user models.User
    if flag {
        flag, user = models.FindUserByToken(token)
    }
    return flag, user
}

var HasPermission = func(ctx *context.Context) {
    ok, user := IsLogin(ctx)
    if !ok {
        ctx.Redirect(302, "/login")
    } else {
        permissions := models.FindPermissionByUser(user.Id)
        url := ctx.Request.RequestURI
        beego.Debug("url: ", url)
        var flag = false
        for _, v := range permissions {
            if a, _ := regexp.MatchString(v.Url, url); a {
                flag = true
                break
            }
        }
        if !flag {
            ctx.WriteString("你没有权限访问这个页面")
        }
    }
}
```

然后在路由配置里添加上路由过滤

```go
beego.InsertFilter("/permission/list", beego.BeforeRouter, filters.HasPermission)
beego.Router("/permission/list", &controllers.PermissionController{}, "GET:List")
beego.InsertFilter("/permission/add", beego.BeforeRouter, filters.HasPermission)
beego.Router("/permission/add", &controllers.PermissionController{}, "GET:Add")
beego.Router("/permission/add", &controllers.PermissionController{}, "Post:Save")
beego.InsertFilter("/permission/edit", beego.BeforeRouter, filters.HasPermission)
beego.Router("/permission/edit/:id([0-9]+)", &controllers.PermissionController{}, "GET:Edit")
beego.Router("/permission/edit/:id([0-9]+)", &controllers.PermissionController{}, "Post:Update")
beego.InsertFilter("/permission/delete/:id([0-9]+)", beego.BeforeRouter, filters.HasPermission)
beego.Router("/permission/delete/:id([0-9]+)", &controllers.PermissionController{}, "GET:Delete")
```

这样在请求路由的时候会先进行权限验证

## 页面判断

页面通过自定义模板来判断 按钮/菜单 显示隐藏

```go
func HasPermission(userId int, name string) bool {
    return models.FindPermissionByUserIdAndPermissionName(userId, name)
}
```

```html
{{if haspermission .UserInfo.Id "user:list"}}<li><a href="/user/list">用户管理</a></li>{{end}}
{{if haspermission .UserInfo.Id "role:list"}}<li><a href="/role/list">角色管理</a></li>{{end}}
{{if haspermission .UserInfo.Id "permission:list"}}<li><a href="/permission/list">权限管理</a></li>{{end}}
```

具体代码点击 [pybbs-go](https://github.com/tomoya92/pybbs-go/)