---
layout: post
title: MySQL主从复制配置
date: 2019-10-24 10:21:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
{:toc}





mysql自带的就有主从复制功能，原理是通过主节点的bin-log日志来实现的数据同步

master开启bin-log日志 -> slave开启同步日志 -> slave读取master的bin-log中的sql语句达到同步数据的功能

## 安装mysql

既然要做主从复制，就先要有两台服务器，并在每台服务器上安装好mysql服务，这里省略

我这里安装好的两台服务器的ip分别是 `192.168.16.87` `192.168.16.109` 下面可能会用到，请根据自己的ip自行修改一些sql语句

## 开启bin-log日志

**master**

修改mysql的配置文件

```bash
$ sudo vim /etc/mysql/mysql.cond.d/mysqld.conf
```

将如下两行注释去掉保存即可

```
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
```

重启mysql服务，登录mysql后运行

```mysql
show variables like '%log_bin%';
```

可以看到bin-log的开启是否成功

![](/assets/QQ20191029-112253@2x.png)

**slave**

然后配置从节点

同样的打开mysql的配置文件，添加下面三行配置

```
server-id = 2
relay-log = /var/log/mysql/relay-bin.log
relay-log-index = /var/log/mysql/relay-bin.index
```

其中 `server-id` 一定不能跟主节点的重复

重启服务

## 配置用于同步的用户

开启了bin-log，然后配置一个用户用于同步这些日志

这个用户配置在主节点上，因为从节点要连主节点读取日志信息，所以这个用户就需要主节点来提供

创建用户并赋予权限，用户名`sync_db`

```mysql
> create user 'sync_db'@'%' identified by '123123';
> grant replication slave on *.* to 'sync_db'@'%' identified by '123123';
```

## 在从节点开启同步

主节点有了用户，就可以在从节点开启同步功能了

登录mysql，运行下面命令开启同步功能

```mysql
> change master to master_host = '192.168.16.87', master_port=3306, master_user='sync_db', master_password='123123', master_log_file='mysql-bin.000001', master_log_pos=0;
> start slave;
```

关闭同步

```mysql
> stop slave;
```

查看同步开启状态

```mysql
> show slave status;
```

如果看到下图中两个字段都是`YES`了，就说明开启成功了

![](/assets/QQ20191029-114220@2x.png)

这时候在主节点上创建数据库，添加数据，创建表等操作都会被自动的同步到从节点上的mysql数据库中


