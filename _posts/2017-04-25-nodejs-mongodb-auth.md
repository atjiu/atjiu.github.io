---
layout: post
title: mongodb创建用户管理数据库
date: 2017-04-25 16:23:00
categories: nodejs学习笔记
tags: mongodb
---

* content
{:toc}

## 安装mongodb

1可以参照这个安装 https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/ 

但我到`sudo apt-get install -y mongodb-enterprise`这一步出问题了，总提示没有mongodb-enterprise这个包，最后用`sudo apt install mongodb`装上了，反正也能用

## 创建用户

mongodb在admin库里创建用户来管理所有的其它用户，方法如下：




```sh
use admin

db.createUser({user: 'root', pwd: '123123', roles: ['dbAdminAnyDatabase', 'userAdminAnyDatabase']})
```

然后进入其它库，去创建当前库的用户

```sh
use demo //进入demo这个数据库

db.createUser({user:'hello', pwd: '123123', roles:[{role: 'readWrite', db:'demo'}, {role: 'dbAdmin', db: 'demo'}]})
```

## 修改配置文件

我装好mongodb后，它的配置文件在 `/etc/mongodb.conf` 下

```sh
sudo vim /etc/mongodb.conf

将其中的 `auth=true` 的注释放开
```

然后重启服务

```sh
sudo service mongodb restart
```

## 角色说明

- dbAdminAnyDatabase: 只在admin数据库中可用，赋予用户所有数据库的dbAdmin权限。
- userAdminAnyDatabase: 只在admin数据库中可用，赋予用户所有数据库的userAdmin权限
- readWrite: 允许用户读写指定数据库
- dbAdmin: 允许用户在指定数据库中执行管理函数，如索引创建、删除，查看统计或访问system.profile
- ...

详见：http://www.cnblogs.com/zhoujinyi/p/4610050.html 

## 其它相关

```sh
// 终端进入
$ mongo
> use demo
> db.auth('hello', '123123')
> db.xx.find()

// mongoose 框架连接
mongoose.connect('mongodb://hello:123123@127.0.0.1/demo');
```

## 参考

- http://www.cnblogs.com/zhoujinyi/p/4610050.html
- https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/
- https://docs.mongodb.com/manual/tutorial/create-users/

