---
layout: post
title: nginx用法总结，映射静态资源，代理http，负载均衡，tcp服务，附带 haproxy 简单配置
date: 2019-10-12 16:59:00
categories: 杂项
tags: nginx
author: 朋也
---

* content
{:toc}

用nginx也有好多年了，还没有总结过，这篇博客总结一下





## 安装

我测试环境是在mac，平时用的服务器有ubuntu和centos

```bash
# mac
brew install nginx

# ubuntu
apt install nginx

# centos
yum install nginx
```

启动，重启服务

```bash
# mac
brew services start/restart/reload nginx

# ubuntu
service nginx start/restart/reload

# centos
systemctl start/restart/reload nginx.service
```

## 映射静态文件

nginx启动就会接管服务器上的80端口，所以如果服务器上有80端口的服务，会启动失败，解决办法就是停了它们或者卸载它们，比如另一个服务器 apache，它也是占用80端口的

一般正常情况都是使用不同的域名解析到一个服务器上，然后通过nginx来实现不同服务之间的转发

我这里以修改hosts来实现域名的解析

```
127.0.0.1 demo.com
```

在电脑上创建一个文件夹，里面放上一张图片，然后配置nginx，配置文件在

```bash
# mac
/usr/local/etc/nginx

# ubuntu/centos
/etc/nginx
```

一般nginx都会有个默认的配置文件 `nginx.conf` 在里面可以找到这样一段 `include servers/*;` 或者 linux系统上就是 `include conf.d/*;`

这样我就可以把nginx的配置文件写在它包含进去的文件夹里了，mac上装好nginx后，在`/usr/local/etc/nginx`里没有 `servers` 目录，可以自己创建一个，nginx的配置文件一般都是以 `.conf` 结尾

在 `servers` 里新建一个文件 `demo.conf` 名字随便取，添加上下面配置

```conf
server {
    listen 80;
    server_name demo.com;
    location / {
        root /Users/hh/Desktop/static;
    }
}
```

其中 `/Users/hh/Desktop/static` 就是我放图片的静态文件目录，重新加载nginx

```bash
brew services reload nginx
```

浏览器访问 `http://demo.com/0.png` 即可打开图片

---

既然nginx可以映射静态资源文件，那前端框架写的项目打包后可不可以用它映射成服务呢？

是可以的，但如果有框架里用到了前端路由，就会有问题（没记错的话要么是404，要么是返回报错），这时候稍微加一些配置就可以解决了

```conf
server {
    listen 80;
    server_name demo.com;
    location / {
        root /Users/hh/Desktop/react-demo/build;
        index index.html;
        autoindex on;
        set $fallback_file /index.html;
        if ($http_accept !~ text/html) {
            set $fallback_file /null;
        }
        if ($uri ~ /$) {
            set $fallback_file $uri;
        }
        try_files $uri $fallback_file;
    }
}
```

重启nginx服务，再次访问就没有什么问题了

## 代理网站（http代理）

使用nodejs中的 serve 模块启动一个http服务

```bash
serve -l 3000 /Users/hh/Desktop/nginx-demo/demo
```

文链接原: [https://atjiu.github.io/2019/10/12/nginx-tutorial/](https://atjiu.github.io/2019/10/12/nginx-tutorial/)


在 `/Users/hh/Desktop/nginx-demo/demo` 目录下我创建了一个 `index.html` 文件，内容

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document demo</title>
  </head>
  <body>
    hello world! demo.com
  </body>
</html>
```

配置nginx，可以在上一个 demo.conf 文件里继续配置，也可以自己再新建一个配置文件，这里还用的是 demo.com 这个域名，先把映射静态文件的配置注释掉

```conf
server {
    listen 80;
    server_name demo.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

重新加载nginx，然后浏览器访问：`http://demo.com` 即可看见 index.html 的内容

## nginx负载均衡

使用场景：

1. 一台服务器性能不够，要增加服务器
2. 不停服部署

说白了就是一个请求交由nginx根据负载均衡的配置来分发到不同的服务器上进行业务处理，举个例子

我这启动了两个服务，端口分别是 3000, 3001

两个页面分别是

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document demo</title>
  </head>
  <body>
    hello world! demo.com
  </body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document demo</title>
  </head>
  <body>
    hello world! demo1.com
  </body>
</html>
```

将之间的配置注释掉，修改nginx的配置

```conf
upstream demo_server {
    server 127.0.0.1:3000 weight=3;
    server 127.0.0.1:3001 weight=7;
}
server {
    listen 80;
    server_name demo.com;
    location / {
        proxy_pass http://demo_server;
    }
}
```

我这里把 3000 端口的服务权重定为3，3001的权重定为 7，然后重启nginx，访问 `http://demo.com` 一直刷新页面，大概10次里会有3次出现3000端口的页面，7次是3001服务的页面内容

## tcp代理

tcp代理配置文件的位置稍微不同，找到 `nginx.conf` 文件，找到 `include servers/*;` 然后看它外面还有一层 `http {}` 说明nginx默认是代理http的服务，要想代理tcp的服务就要将配置写在与 `http{}` 同级的地方，我就直接写在 `nginx.conf` 里了，然后将本机上装的mysql服务映射成 `demo.com` 域名访问

配置如下

```conf
stream {
    server {
        listen 80;
        proxy_pass 127.0.0.1:3306;
    }
}
```

重新加载nginx

通过mysql客户端工具，可以直接使用域名连接mysql了

![](https://atjiu.github.io/assets/QQ20191012-174927@2x.png)

tcp也能代理，这就好玩了，各种联机游戏都可以通过nginx来转发了，简直爽歪歪

## haproxy负载均衡

haproxy天生就自带负载均衡

ubuntu安装

```bash
sudo apt install haproxy
```

编辑haproxy的配置文件 `/etc/haproxy/haproxy.cfg`

```
listen
  mode tcp
  bind 0.0.0.0:3307  # 这端口换一下，为了测试
  server s1 192.168.16.87:3306
  server s2 192.168.16.109:3306
```

改好后保存，然后重启haproxy服务 `service haproxy restart`

连接mysql，重复连接几次会发现连接的服务是在 `192.168.16.87`和`192.168.16.109`之间来回的换
