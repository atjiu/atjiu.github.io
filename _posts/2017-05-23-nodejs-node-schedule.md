---
layout: post
title: node-schedule定时任务例子[备忘]
date: 2017-05-23 15:25:44
categories: nodejs学习笔记
tags: nodejs node-schedule
author: 朋也
---

* content
{:toc}

> 对cron表达示的理解备忘
>
> 总共有6个*，分别是 `秒、分、时、日、月、周几`
>
> 如果出现7个* 则最后一个表示 `年`

## 基本用法

```js
var schedule = require('node-schedule');

schedule.scheduleJob('1 * * * * *', function(){
  console.log('echo:' + new Date());
});

```




## cron举例说明

取值范围：

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

例子

```js
1 * * * * * //每分钟的第一秒执行
* 1 * * * * //每小时的第一分钟的每一秒执行
0 1 * * * * //第分钟第0秒都执行
类推：
0 0 1 * * * //第小时的第0分第0秒都执行

说明：* 表示 每x
具体数字表示具体时间数

还可以用上 , - 等

1,2,3,4,5 * * * * * //表示每分钟的1，2，3，4，5秒执行
1-5 * * * * * //表示每分钟的1，2，3，4，5秒执行
```

## 参考

- [Nodejs学习笔记（十二）--- 定时任务（node-schedule)](http://www.cnblogs.com/zhongweiv/p/node_schedule.html)
- [使用node-schedule时的注意点](http://www.tuicool.com/articles/2umMBfz)

**除了node-schedule之外还有一个node-later功能也相当强大**
