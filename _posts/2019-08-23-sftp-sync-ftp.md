---
layout: post
title: 两台centos服务器之间要同步数据，其中一台对外提供ftp服务解决方案
date: 2019-08-23 14:54:00
categories: 杂项
tags: sync
author: 朋也
---

* content
{:toc}

> 碰到一个需求，两台服务器（A，B）A不对外联网，B对外联网，A,B互通
>
> 要求，A里的数据通过sftp(ssh)同步到B上，然后在B上启动一个ftp对外提供下载服务

首先在B上安装一个ftp服务，可以选择 vsftp 或者 pureftp，不多说

然后在B上通过同步工具将A服务器上的目录挂载到B上指定的目录上，既然B对象提供ftp服务，那B上的ftp用户肯定有一个根目录

问题：可以直接将A上的目录通过同步工具挂载到B的ftp用户根目录上吗？






**不行**

---

同步工具用的是 sshfs

安装：

```bash
yum install -y epel-release fuse-sshfs
```

挂载命令，假设两台服务器的ip分别是 `A: 192.168.1.100` `B: 192.168.1.101`

B上的ftp用户名是 `ftpuser` 所以B上ftp用户的根目录就是 `/home/ftpuser`

要将A上的 `/home/origin_dir` 同步到 B上的 `/home/ftpuser/sync_dir`，命令如下

执行命令有两种选择

1. 用B服务器上提供的ftp用户来执行下面这个命令
2. 在命令中添加uid, gid参数来指定同步的目录所属用户和组

PS: 这里用了一个技巧，既然没法将A服务器上的目录挂载到B服务器上ftp用户的根目录上，那就挂载到根目录中的某一个目录上，就没有问题了

```bash
# 1. 直接在B服务器上的ftp用户下执行不需要添加参数
sshfs root@192.168.1.100:/home/origin_dir/ /home/ftpuser/sync_dir/

# 2. 可以在其它用户下执行这个命令比如root登录的用户下执行，添加上 ftp 用户的uid和gid也是一样的效果
# 这个uid,gid可以通过 `cat /etc/passwd` 命令查看到， 我这查到的结果如下
# vsftpd:x:510:511::/home/vsftpd:/sbin/nologin
# 这里的uid就是510，gid就是511了
sshfs -o uid=510,gid=511 root@192.168.1.100:/home/origin_dir/ /home/ftpuser/sync_dir/
```

链接文原: [https://tomoya92.github.io/2019/08/23/sftp-sync-ftp/](https://tomoya92.github.io/2019/08/23/sftp-sync-ftp/)

这样在A上 `origin_dir` 里CRUD文件，实时的就同步到 B上的 `sync_dir` 里了

同样的使用 filezilla 工具通过ftp服务也可以读取到B上的目录结构

取消挂载（一定要先cd出这个挂载的目录才行，否则它会说当前目录处理忙碌状态）

```bash
fusermount -u /home/ftpuser/sync_dir/
```

---

注意：

1. 先启动B上的ftp服务，然后再挂载同步
2. 取消挂载要用 fusermount 命令，**千万不要直接kill掉进程**
