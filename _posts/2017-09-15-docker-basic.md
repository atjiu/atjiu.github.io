---
layout: post
title: docker基础命令（备忘）
categories: docker学习笔记
tags: docker
author: 朋也
---

* content
{:toc}

#### 查看本地镜像

```
docker images
```

#### 删除本地镜像

```
docker images # 拿到IMAGE ID
docker rmi da5939581ac8
# rmi => remove image
```





#### 查看运行过的镜像

```
docker ps // 查看正在运行的镜像
docker ps -a // 查看所以运行过的镜像（包括正在运行和已经停止运行的）
```

#### 清除运行过的镜像记录

```
docker ps -a # 拿到容器的ID
docker rm 57611fd7da07 585f867a6858
# 后面可以跟上多个id，也就可以删除多个
```

#### 下载docker镜像到本地

```
docker pull nginx

# nginx 就是docker官方镜像网站上的一个nginx镜像
```

#### 启动镜像

```
docker run nginx
```

#### 停止容器

```
docker ps // 拿到容器的ID
docker stop 0b234366c3d2
```

#### 暴露端口

```
docker run -p 8080:80 nginx

# 将nginx镜像里的80端口暴露出来，暴露出来的端口为8080，也就是说，可以直接用浏览器访问 http://localhost:8080 就可以了，可以看到一个经典的nginx的默认页面
```

#### 后台运行

```
docker run -d nginx
# d => daemon
```

#### 拷贝文件到docker容器里

```
docker ps # 拿到正在运行容器的ID

# 新建一个index.html文件，里面写上 `hello world`
docker cp index.html 0b234366c3d2://usr/share/nginx/html

# 两次访问 http://localhost:8080 页面就变成了hello world
```

这时候如果把这个正在运行的docker容器停掉的话，下次再启动的时候，就又是默认的页面了，之前拷贝进去的index.html没有了，怎么保存呢？看下面

#### 保存镜像

```
docker ps # 拿到正在运行容器的ID
docker commit -m 'message' 0b234366c3d2 my-nginx

# -m 是保存镜像的描述信息
# 0b234366c3d2 是容器的ID
# my-nginx 是保存后的镜像名字
```

#### 挂载文件

上面说到，如果容器被停止了，那复制到容器里的文件也都没有了，可以用 `docker commit` 的方式保存下来，是个办法，下面说一下挂载的方法，更简单实用

```
# 在当前目录新建一个文件夹 `html`
# 把上面新建的那个 `index.html` 文件拷贝到html里
docker run -d -p 8080:80 -v $PWD/html:/usr/share/nginx/html nginx
# -v 就是挂载参数
# $PWD shell命令，输出当前目录的绝对地址

# 这样挂载后，在本地的html文件夹里修改index.html，然后浏览器访问是实时更新的，停掉了容器也不用担心文件会消失
```

#### 进入容器

```
docker ps # 拿到正在运行容器的ID
docker exec -it 0b234366c3d2 bash
```
