---
layout: post
title: ActiveMQ学习-安全认证-连接AMQ用户密码配置 (2)
date: 2018-11-06 19:36:00
categories: ActiveMQ学习笔记
tags: activemq
author: 朋也
---

* content
{:toc}

## ActiveMQ控制台认证

控制台默认的用户名密码都是 `admin`

可以在ActiveMQ配置文件里修改，如果下载的是二进制包，则打开ActiveMQ文件夹下的`conf`文件夹(如果用的是homebrew安装的ActiveMQ，配置文件位置 `/usr/local/Cellar/activemq/5.15.7/libexec` )，打开里面的 `jetty-realm.properties` 文件

文件内有如下默认配置

```
# username: password [,rolename ...]
admin: admin, admin
user: user, user
```





看上面注释可以知道，第一个是用户名，第二个是密码，第三个是角色

所以这里可以将admin的用户名密码修改了，然后重启ActiveMQ，再次打开 `http://locahost:8161/admin/` 就可以用新用户名密码登录了

## 连接ActiveMQ认证

上一篇HelloWorld里连接ActiveMQ用的是ActiveMQ jar包内的默认用户名密码，默认是 用户名：`system` 密码：`manager`

这个认证信息也是可以修改的，还是`conf`文件夹，打开 `credentials.properties` 文件，可以看到默认配置

```
activemq.username=system
activemq.password=manager
guest.password=password
```

将 `activemq.username` `activemq.password` 修改成自己想设置的用户名密码即可，别忘了程序里也要同步修改
