---
layout: post
title: nodejs, java中执行shell命令并拿到输出内容
date: 2019-05-22 21:00:00
categories: 杂项
tags: java nodejs shell
author: 朋也
---

* content
{:toc}

> 公司用的jenkins在配置的时候全都是脚本, 然后我就想着能否用开发语言调用linux上的命令拿到输出内容, 这样不就可以做一个日志监控站了吗!
>
> 然后就折腾了一下, 实现了nodejs和java里的用法




nodejs实现方法

```js
var iconv = require("iconv-lite");
var spawn = require("child_process").spawn;

// 这货第一个参数就是命令本身, 后面的参数要放在数组里, 我最开始把 ping baidu.com 当成命令了, -t 当成参数, 死活没有数据输出
var processObj = spawn("ping", ["baidu.com", "-t"]); // 这个方法后面有个参数可以指定编码, 我这设置没有用..

// 监听执行命令输出内容事件
processObj.stdout.on("data", function(thunk) {
  console.log(iconv.decode(thunk, "gbk"));
});

processObj.stderr.on("data", function(data) {
  console.log("stderr: ", data);
});

processObj.on("close", function(code) {
  console.log("close: ", code);
});

processObj.on("exit", function(code) {
  console.log("exit: ", code);
});
```

先安装一下依赖 `iconv-lite` 然后直接使用nodejs运行即可, 如果你的运行平台是mac或者linux, 这个包是不用安装的, 它主要是用来转码的

在测试的时候发现windows上输出内容中文乱码, 就找到了这个东西来转码

原接文链: [https://tomoya92.github.io/2019/05/22/nodejs-java-shell/](https://tomoya92.github.io/2019/05/22/nodejs-java-shell/)

---

java实现方法

```java
String command = "ping baidu.com -t";
Process process = Runtime.getRuntime().exec(command);
BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream(), Charset.forName("GBK"))); // 这里编码如果是mac或者linux可以使用utf-8
String line;
while ((line = br.readLine()) != null) {
    System.out.println(line);
}
```

---

通过上面代码可以拿到执行命令后的内容, 然后结合websocket输出到页面上, 实现一个日志查询系统相当的爽, 不可有个问题, 没有啥办法能让它停下来...

也可以通过执行 wget 或者 axel 命令来实现一个下载任务