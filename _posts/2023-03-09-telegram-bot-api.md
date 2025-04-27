---
layout: post
title: 利用Telegram实时收发网站消息
date: 2023-03-09 10:41:00
categories: 杂项
tags: telegram
author: 朋也
---

* content
  {:toc}

> telegram的bot api非常好用，就一点不好，被墙了。。

## 创建bot

在tg里搜`Botfather`，跟着里面的步骤来操作就可以了

![](/assets/images/20230309104409.png)

创建好后，会给一个`token` 这个要保存好，后续调用api都是要用到的

## 给bot发消息

如果自己是站长的话，当网站里有评论或者留言，想第一时间收到，就可以利用这个api，让tg来收，及时通知，非常方便

- API文档地址：https://core.telegram.org/bots/api#sendmessage
- API地址：https://api.telegram.org/bot\<token\>/sendMessage

如下在postman里的请求示例

![](/assets/images/20230309104924.png)

**注意，参数里的chat_id有个坑，文档里说可以是username,或者user_id，我用自己的tg名死活就不行，还是要用自己的user_id才能发送成功**

那怎么拿到自己的user_id呢？

可以关注一个 `@userinfobot` 机器人，就能拿到了

![](/assets/images/20230309105202.png)

接口调成功后，在tg里就能收到消息了

![](/assets/images/20230309105304.png)

## 接收bot消息

想象另一个场景，收到了自己网站上的消息，但又不想打开网站，想直接进行回复或者删除操作等，就需要用到`webhook`功能了

**先告诉tg回调地址是啥**

- API文档地址：https://core.telegram.org/bots/api#setwebhook
- API接口地址：https://api.telegram.org/bot\<token\>/setWebhook

![](/assets/images/20230309142342.png)

设置webhook地址后，就可以在自己系统上接收tg里的消息了

java接收方式

```java
ServletInputStream inputStream = request.getInputStream();
BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
StringBuilder sb = new StringBuilder();
String buff;
while ((buff = reader.readLine()) != null) {
    sb.append(buff);
}
System.out.println(sb.toString());
```

## 消息带按钮

给tg发消息可通过传 `reply_markup.inline_keyboard` 对象来给消息添加按钮

![](/assets/images/20230310101844.png)

![](/assets/images/20230310102024.png)

当点击这两个按钮时，tg就会给webhook设置的url发起请求，将消息接收下来看一下长什么样就知道怎么对接了，可以做出更多有意思的东东

