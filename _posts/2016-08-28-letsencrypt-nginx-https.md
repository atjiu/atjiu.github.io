---
layout: post
title: 申请letsencrypt证书结合nginx实现网站https访问（支持泛域名）
date: 2016-08-28 17:26:35
categories: 杂项
tags: letsencrypt
author: 朋也
---

* content
{:toc}

> 现在有更简单的方法配置了 [https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04][1]

## 安装生成证书工具

我使用的是ubuntu系统

```bash
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

安装nginx

```bash
sudo apt install nginx
```

## 配置nginx

编辑nginx文件 `/etc/nginx/sites-available/default` 文件

```
server {
  server_name yiiu.co;

  location / {
    proxy_pass   http://127.0.0.1:3000/;
    include conf.d/proxy.conf;
  }
}
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

## 生成证书

注意生成证书之前nginx要启动，而且域名要解析到服务器上

运行命令

```bash
sudo certbot --nginx -d yiiu.co
```

跟着步骤操作，最后会发现它把nginx都给配置的好好的，什么都不用管了，最后重启nginx即可

```
service nginx start
```

## 自动续期

letsencrypt生成的证书最多只有3个月有效期，这里利用ubuntu的系统自带的定时任务来解决这个问题

运行 `crontab -e` 命令，进入到定时任务的编辑界面，然后添加上下面这段命令，命令意思是7天运行一次，在夜里3点运行

```bash
0 3 */7 * * certbot renew —renew-hook "/etc/init.d/nginx reload"
```

## 申请泛域名

泛域名我开始也不知道，今天群里大佬告知后才知道，原来申请一个 `*.yourdomain.com` 就可以能用所有的二级域名了，这样就不用一个一个的去申请证书了，大大的方便了管理

阿里也有免费的https证书，但它不支持泛域名，网上查了一下letsencrypt，它还真支持，果断折腾，其实也就一条命令的事

```bash
certbot certonly --preferred-challenges dns --manual -d yiiu.co -d *.yiiu.co --server https://acme-v02.api.letsencrypt.org/directory
```

在申请证书的过程中，它要求到域名解析两个TXT记录（我看网上都说只需要配置一次就可以了，不知道为啥我申请的时候要配置两次），按照它的要求配置一下即可

注意，这种申请方式是手动的(manual)，不是上面自动的(nginx)，看命令参数应该就能明白，所以证书申请好了，还要自己去配置一下nginx，需要配置的内容如下，拷贝到nginx配置文件里的server { /*放在这里*/ }

```conf
server {
  server_name yiiu.co dev.yiiu.co;

  location / {
    proxy_pass http://localhost:3000;
    include conf.d/proxy.conf;
  }

  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/yiiu.co/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/yiiu.co/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

配置好了，保存，运行 `nginx -t` 检查一下配置文件的正确性，没问题就可以重启nginx了

这种方式的自动续期跟上面一样

## 注意事项

1. 如果服务器上80端口被占用了,必须停掉,否则证书生成会失败,强烈建议80端口交给nginx
2. 在生成证书的时候要停掉nginx(原因就是nginx占用了80端口)

## 删除证书

```bash
rm -rf /etc/letsencrypt/live/www.example.com/
rm -rf /etc/letsencrypt/archive/www.example.com/
rm /etc/letsencrypt/renewal/www.example.com.conf
```

如果碰到给证书续期失败的时候, 可以尝试删除生成的证书, 然后再次运行上面生成证书的命令获取证书, 就没有问题了

[1]: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04
