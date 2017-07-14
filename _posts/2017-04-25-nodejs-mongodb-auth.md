---
layout: post
title: MongoDB创建用户管理数据库以及备份还原
date: 2017-04-25 16:23:00
categories: mongodb学习笔记
tags: mongodb
author: 朋也
---

- content
{:toc}

# 安装mongodb

可以参照这个安装 <https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/>

但我到`sudo apt-get install -y mongodb-enterprise`这一步出问题了，总提示没有mongodb-enterprise这个包，最后用`sudo apt install mongodb`装上了，反正也能用




# 创建用户

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

如果创建用户错误了，可以用 `db.updateUser()` 方法来修改，如果不想要这个用户了，可以用 `db.removeUser()` 方法来删除

具体参考见：

- [db.updateUser()](https://docs.mongodb.com/manual/reference/method/db.updateUser/)
- [db.removeUser()](https://docs.mongodb.com/manual/reference/method/db.removeUser/)

# 修改配置文件

我装好mongodb后，它的配置文件在 `/etc/mongodb.conf(也可能是mongo.conf)` 下

```sh
sudo vim /etc/mongodb.conf
//mongodb 2.4
将其中的 `auth=true` 的注释放开, 没有的话添加这项
//如果mongodb版本是2.6+，就在security节点下面加上下面配置
security:
  authorization: enabled
```

然后重启服务

```sh
sudo service mongodb restart
//没有mongodb服务的话，就用mongo
sudo service mongo restart
```

# 角色说明

- dbAdminAnyDatabase: 只在admin数据库中可用，赋予用户所有数据库的dbAdmin权限。
- userAdminAnyDatabase: 只在admin数据库中可用，赋予用户所有数据库的userAdmin权限
- readWrite: 允许用户读写指定数据库
- dbAdmin: 允许用户在指定数据库中执行管理函数，如索引创建、删除，查看统计或访问system.profile
- ...

详见：<http://www.cnblogs.com/zhoujinyi/p/4610050.html>

# 数据库备份

```sh
$ mongodump -d demo -o ./ -u demo -p 123123
// -d : 指定数据库名称
// -o : 指定备份到哪（./ 表示备份到当前目录)
// -u, -p : 如果数据库没有做认证，这两个参数可以不带，如果设置了认证，就是当前数据库的用户名跟密码
```

# 还原数据库

```sh
//先进入到备份的文件夹里
$ mongorestore -d demo ./demo -u demo -p 123123
// -d : 指定数据库名称
```

# 其它相关

```sh
// 终端进入
$ mongo
> use demo
> db.auth('hello', '123123')
> db.xx.find()

// mongoose 框架连接
mongoose.connect('mongodb://hello:123123@127.0.0.1/demo');

//对文件夹压缩，解压
//压缩
$ tar -zcvf demo.tar.gz ./demo
//解压
$ tar -zxvf demo.tar.gz
```

# 参考

- <http://www.cnblogs.com/zhoujinyi/p/4610050.html>
- <https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/>
- <https://docs.mongodb.com/manual/tutorial/create-users/>
