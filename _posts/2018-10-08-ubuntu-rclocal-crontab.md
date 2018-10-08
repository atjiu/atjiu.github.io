---
layout: post
title: Ubuntu里开机自启动和定时任务
date: 2018-10-08 15:01:00
categories: 杂项
tags: ubuntu rc.local crontab
author: 朋也
---

* content
{:toc}

## 开启自启动

如果是系统安装的服务，可以通过命令添加开机自启动

```sh
# 设置mongodb数据库开机自启动
systemctl enable mongod.service

# 相应的启动，重启，停止
systemctl start mongod.service
systemctl restart mongod.service
systemctl stop mongod.service
```

如果不是系统安装的服务，而是自己下载的工具，可以通过将命令添加进 `rc.local` 里来实现开机自启动





```sh
# 比如设置 frp 服务在开机自启动
# 假设 frp 目录位置在 /opt/frp 

sudo vim /etc/rc.local

# 在 exet 0 之前加上如下命令，请根据你的目录进行相应的修改
./opt/frp/frpc -c /opt/frp/frpc.ini > /opt/frp/log.file 2>&1 &
```

PS：说明一下，这里我测试的结果是必须要使用 **全路径** ，即使把上面的命令写成 `.sh` 的脚本，然后在 `rc.local` 里运行脚本也是不行的，如果你的可以，希望在下面评论里告诉我

## 系统定时器

ubuntu 自带了个 `crontab` 相当好用

我现在有个需求是每隔一分钟运行一次爬虫文件，这时 `crontab` 就派上用场了

在当前登录的用户下（命令前不用加sudo的）运行下面命令

```sh
crontab -e  # -e 是编辑的意思
```

操作跟 vim 命令一样，翻到最下面，添加一条

```sh
# 假如我的爬虫文件在 /opt/crawling/crawling.js , 我的node命令位于 /home/h/.nvm/versions/node/v8.0.0/bin/node
# m h dom mon dow command
*/1 * * * * /home/h/.nvm/versions/node/v8.0.0/bin/node /opt/crawling/crawling.js > /opt/crawling/log.file 2>&1
```

上面命令里的 `*/1 * * * *` 是cron表达式，从左到右意思分别是 `分(0-59)` `时(0-23)` `一月中的某一天(1-31)` `月(1-12)` `一周中某一天(0-6, 0:星期天)`

这里给一个 [Crontab表达式执行时间验证](http://atool.org/crontab.php) 的网站，可以测试自己的表达式执行的状态
