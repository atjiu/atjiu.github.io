---
layout: post
title: springboot服务优雅关机脚本（在停止服务的命令发出后将执行完正在运行的进程）外加检测进程死掉自动启动脚本
date: 2019-05-31 07:40:00
categories: spring-boot学习笔记
tags: spring-boot shell
author: 朋也
---

* content
{:toc}

自从用上springboot开发项目后，服务都是打jar包然后通过 `java -jar xx.jar` 的方式来启动的

比如下面这个脚本就是启动pybbs的脚本，加载 prod 配置文件，启动后在后台运行，将日志写在jar包目录下的 log.file 里

```bash
#!/bin/bash -e
java -jar pybbs.jar --spring.profiles.active=prod > log.file 2>&1 &
```

---

相应的关机脚本也是从网上找的，不知是哪个大佬写的，在网上能找到的关机脚本基本上都长下面这个样

```bash
#!/bin/bash -e
ps -ef | grep pybbs.jar | grep -v grep | cut -c 9-15 | xargs kill -s 9
```

可以看到在命令最后加上了个参数 `-s 9` 在 kill 命令中 -9 是强制kill的意思，不管服务有没有正在运行的进程，它都直接给杀掉

要做到优雅关机，只需要把后面的 `-s 9` 删掉就好了，不带 -9 参数，它会等待进程运行完正在执行的任务，一直到没有正在运行的任务的时候再杀掉

**不过这货也有个不好的地方，当项目中用到了定时器，就有可能会出现杀不掉的现象，到时还是要用上-9参数**

原接文链: [https://tomoya92.github.io/2019/05/31/spring-boot-gracefully-shutdown/](https://tomoya92.github.io/2019/05/31/spring-boot-gracefully-shutdown/)

当然 spring-boot 框架也自带了一个监听服务，如果服务在启动状态，发送一个POST请求就可以优雅的停机，感觉还是没有脚本来的直接

---

服务器上一个服务死没死，死了之后要重启一般都是人主动发现然后手动去启动的，下面这个脚本可以通过检测然后实现服务死掉自动启动

```bash
#!/bin/bash -e
ps -ef | grep pybbs.jar | grep -v grep
if [$? -ne 0]
then
  echo "server is stoped! start..."
  java -jar pybbs.jar --spring.profiles.active=prod > log.file 2>&1 &
else
  echo "server is running..."
fi
```

然后可以将这个脚本放在系统的定时任务里执行，关于定时任务的用法可以查看[Ubuntu里开机自启动和定时任务cron](https://tomoya92.github.io/2018/10/08/ubuntu-rclocal-crontab/)

**注意：如果用定时任务时，在被执行的脚本里如果有通过export导入的命令的话，就要写上全路径，因为在系统启动的时候，定时任务不会去提前加载环境变量**
