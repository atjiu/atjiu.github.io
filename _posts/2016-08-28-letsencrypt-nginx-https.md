---
layout: post
title: letsencrypt结合nginx配置https备忘
date: 2016-08-28 17:26:35
categories: 杂项
tags: letsencrypt nginx https
author: 朋也
---

* content
{:toc}

> 现在有更简单的方法配置了 [https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04][1]

备忘一下我使用letsencrypt结合nginx配置网站https的过程

## ssh登录服务器,克隆letsencrypt仓库

```
git clone https://github.com/letsencrypt/letsencrypt
```

## 进入letsencrypt目录,执行命令




```
./letsencrypt-auto certonly --standalone --agree-tos --email $youremail$ -d tomoya.cn -d blog.tomoya.cn
//替换掉 $youremail$ 修改成你的邮箱
```

成功后会提示证书生成的目录, 我的目录是在 `/etc/letsencrypt/live/tomoya.cn/fullchain.pem`

## 配置nginx

编辑nginx文件 `/etc/nginx/sites-available/default` 文件

```
server {
  listen 443;
  server_name tomoya.cn;

  ssl on;
  ssl_certificate /etc/letsencrypt/live/tomoya.cn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/tomoya.cn/privkey.pem;

  ssl_session_timeout 5m;

  ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass   http://127.0.0.1:4003/;
    include conf.d/proxy.conf;
  }
  error_page   500 502 503 504  /50x.html;
  location = /50x.html {
    root   /usr/share/nginx/html;
  }
}
```

主要就是配置证书位置

```
ssl_certificate /etc/letsencrypt/live/tomoya.cn/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/tomoya.cn/privkey.pem;
```

`conf.d/proxy.conf` 文件内容

```
# proxy.conf
proxy_redirect          off;
proxy_set_header        Host            $host;
proxy_set_header        X-Real-IP       $remote_addr;
proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
client_max_body_size    20m;
client_body_buffer_size 128k;
proxy_connect_timeout   90;
proxy_send_timeout      90;
proxy_read_timeout      90;
proxy_buffers           32 4k;
```

配置http跳转到https

编辑 `/etc/nginx/conf.d/default.conf` 文件, 没有的自己创建

```
server {
  listen 80;
  server_name tomoya.cn;
  return 301 https://$host$request_uri;
}
```

最后启动nginx就ok了

```
service nginx start
```

## 注意事项

1. 如果服务器上80端口被占用了,必须停掉,否则证书生成会失败,强烈建议80端口交给nginx
2. 在生成证书的时候要停掉nginx(原因就是nginx占用了80端口)

[1]: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04
