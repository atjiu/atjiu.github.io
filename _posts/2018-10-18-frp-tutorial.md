---
layout: post
title: 利用frp内网穿透实现用自家电脑发布网站(不用买服务器了)
date: 2018-10-18 10:21:00
categories: Golang学习笔记
tags: frp
author: 朋也
---

* content
{:toc}

> 一直想总结一下使用frp的经验，今天来写一下
>
> 我的yiiu.co域名的网站都是用frp做的内网穿透实现的，服务器就在我身边，发布的网站服务外网都访问，下面就来说说我的配置方法

## 下载frp

这个不多说，选择好自己的平台就可以了，注意版本号一定要一致，[下载地址](https://github.com/fatedier/frp/releases)

打开可以看到 linux 平台有很多版本，386, amd64, arm, arm64 等等，这里说一下，如果你服务器是32位，就下载 386，如果你服务器是64位的，而且你又不能分清cpu是arm架构的还是amd架构的，那也选386

总之一句话，对系统架构分不清的就只下载386的就对了





解压下载好的压缩包，可以看到几个文件

```
.
├── LICENSE
├── frpc
├── frpc.ini
├── frpc_full.ini
├── frps
├── frps.ini
└── frps_full.ini
```

各文件说明

- LICENSE 版权说明文件
- frpc 客户端启动命令
- frpc.ini 客户端配置文件
- frpc_full.ini 客户端配置文件参考文件
- frps 服务端启动命令
- frps.ini 服务端配置文件
- frps_full.ini 服务端配置文件参考文件

## frp运行流程

做内网穿透需要事先准备的

1. 一台外网服务器
2. 一台内网服务器

一次请求的经过，最简单的流程

用户请求(浏览器) -> 外网服务器ip -> 外网服务器上部署的frps -> 内网服务器上部署的frpc -> 内网服务器上部署的服务 

请求成功后，响应过程与请求过程相反

这个过程中还可以加上 nginx 来做不同域名共用80端口的转发工作，那样就会变成

用户请求(浏览器) -> 外网服务器ip -> 外网服务器nginx -> 外网服务器上部署的frps -> 内网服务器上部署的frpc -> 内网服务器nginx -> 内网服务器上部署的服务 

好了明白这些了，就可以来做配置了

## 配置frps

想办法把 `frps` `frps.ini` 拷贝到外网服务器上

我这假设放在 `/opt/frp/` 下，假设外网服务器ip是 `10.10.10.10`, 假设网站域名是 `example.com`

修改 `frps.ini` 

```
[common]
bind_port = 7000
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = 123123
token = 123123
vhost_http_port = 8000
subdomain_host = example.com
```

- bind_port frps启动时要占用的端口
- dashboard_port frps启动后管理后台的端口
- dashboard_user frps启动后管理后台登录的用户名
- dashboard_pwd frps启动后管理后台登录的密码
- token frpc连接frps时要用到的令牌，如果不设置任何一个frpc都能连进来就不安全了
- vhost_http_port frps转发的内网服务的端口
- subdomain_host 你的域名

然后启动 frps 

```
# 给frps附上可执行权限
sudo chmod +x frps
# 在后台运行并将日志写入到当前目录下的 log.file 里
./frps -c frps.ini > log.file 2>&1 & 
```

## 配置frpc

想办法把 `frpc` `frpc.ini` 拷贝到内网服务器上

我这假设放在 `/opt/frp/` 下, 假设要配置的网站域名是 `example.com` `bbs.example.com` `blog.example.com` 三个域名

修改 `frps.ini`

```
[common]
server_addr = 10.10.10.10
server_port = 7000
token = 123123

[example]
type = http
local_ip = localhost
local_port = 8080
use_encryption = false
use_compression = true
custom_domains = example.com

[bbs]
type = http
local_ip = localhost
local_port = 8081
use_encryption = false
use_compression = true
subdomain = bbs

[blog]
type = http
local_ip = localhost
local_port = 8082
use_encryption = false
use_compression = true
subdomain = blog
```

相关配置说明

- server_addr 外网服务器的ip，也就是frps所在服务器的ip
- server_port frps.ini 上配置的 bind_port 
- token 必须跟在 `frps.ini` 里配置的 token 一致，否则会导致连不上frps
- use_encryption 是否使用加密，我这没用，因为我在外网通过nginx配置了https所以内网的服务都是http的
- use_compression 是否使用压缩，使用了网站响应数据会小一些，网站速度也会更快一些
- subdomain 二级域名的名字

启动 frpc

```
# 给frps附上可执行权限
sudo chmod +x frpc
# 在后台运行并将日志写入到当前目录下的 log.file 里
./frpc -c frpc.ini > log.file 2>&1 & 
```

注意：内网服务器上要启动三个web服务，分别端口对应 8080, 8081, 8082

## 映射ssh

如果我们不在内网服务器旁边，web服务要是出问题了，会比较麻烦，这时可以通过frp映射一个ssh，这样就可以随时随地的操作内网了

只需要配置frpc.ini 即可

```
[common]
...

[ssh]
type = tcp
local_ip = localhost
local_port = 22
remote_port = 7001

[example]
...
```

同样的方法还可以映射游戏，同样的使用 `type = tcp` 把端口改成游戏的端口就可以了，比如Minecraft的端口是25565，是不是相当的方便，快跟小伙伴组队吧

重启 frpc , 然后就可以使用命令 `ssh -p 7001 root@10.10.10.10` 来连接内网的终端了 

## 总结

1. 你可以通过访问 `http://10.10.10.10:7500` 然后输入 `frps.ini` 里配置的 `dashboard_user` `dashboard_pwd` 来查看frp的运行情况
2. 在启动frpc之前，你要在域名提供商那把域名解析到外网服务器上
3. 如果ssh映射连接总是超时，要看一下外网服务器是否把7001端口开放了，有可能是外网服务器的防火墙拦住了
4. 关于nginx配置https，参见：[https://tomoya92.github.io/2016/08/28/letsencrypt-nginx-https/][1]

## 参考

- [https://github.com/fatedier/frp/blob/master/README_zh.md][2]

[1]: https://tomoya92.github.io/2016/08/28/letsencrypt-nginx-https/
[2]: https://github.com/fatedier/frp/blob/master/README_zh.md