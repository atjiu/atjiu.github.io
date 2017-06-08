---
layout: post
title: 利用git仓库部署hexo搭建的博客
date: 2016-08-25 18:32:57
categories: nodejs学习笔记
tags: nodejs hexo git
author: 朋也
---

* content
{:toc}

昨天用hexo搭建了个本博客，主题用的是next，想发布博客还要将.md文件上次到服务器上，比较麻烦，本篇博客介绍一下利用ubuntu的定时任务和国内的git仓库来免传服务器部署

我用的是oschina的git仓库，当然也可以使用github，或者coding或者其他的git仓库，只要能git pull代码就可以了




1. 在gitosc上新建一个私人仓库
2. 在服务器上创建一个目录
    ```sh
    mkdir /home/gitosc
    ```
3. 将代码clone到服务器上
    ```sh
    git clone https://user:passwd@git.oschina.net/xxx/blog.git
    //user是用户名，passwd是密码，后面是git仓库的地址
    ```
4. 在服务器上创建定时任务
    ```sh
    sudo crontab -e // 回车会出现一个编辑界面

    //在编辑界面里添加上
    */1 * * * * cd /home/gitosc/blog && git pull && cp -rf ./*.md /home/nodejs/blog/source/_posts/

    //每1分钟就会到git仓库里去获取最新代码。我的hexo博客在服务器上的位置是 /home/nodejs/blog/source/_posts/ 所以复制到的地方就是这个地址
    ```
5. 重启定时服务
    ```sh
    sudo service cron restart
    ```

这样就可以在平时是用的电脑上写博客，然后通过git push到git仓库里，服务器上的定时任务会定时拉取最新的博客然后复制到hexo的_posts文件夹里，打开博客地址刷新就可以了

懒人必备
