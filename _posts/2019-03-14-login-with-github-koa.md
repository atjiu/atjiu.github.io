---
layout: post
title: 使用Github授权登录个人网站步骤整理（备忘）
date: 2019-03-14 10:31:00
categories: nodejs学习笔记
tags: koa
author: 朋也
---

* content
{:toc}

> 开发网站时懒得写登录注册那堆东西就会想到用Github授权登录，为啥会选择Github呢？因为它不需要审核呀，到Github上申请完就可以用了
>
> 如果用微博，QQ这种授权登录，首先也是要申请，但它们都要审核，如果接入的是网站，那网站还要备案才能通过，审核时间还很长

## 申请

地址：[https://github.com/settings/developers](https://github.com/settings/developers)

具体操作可以参见pybbs的文档：[https://atjiu.github.io/pybbs/#/zh-cn/oauth](https://atjiu.github.io/pybbs/#/zh-cn/oauth)






## 集成

Github授权登录的流程如下

1. 调用github的请求授权地址，要带上申请的application的client_id
2. github验证client_id后，会回调网站，返回一个code
3. 拿着这个code请求github获取access_token的地址
4. 获取access_token后，就可以调用github的用户信息接口了

### 请求Github授权

```js
exports.github = async (ctx) => {
  // 随机一个state，这个参数是可选的，不过如果带着的话，当github回调时会原封不动的带回来，这样就可以验证是不是正常流程请求的授权了
  const state = str_util.random_str(4);
  // 将state放到session里，这样在回调里可以获取到，然后进行比对
  ctx.session.state = state;

  const client_id = 'xxxxxxxxxxxxxxxxxx';
  const client_secret = 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';
  const callback_url = 'http://example.com/callback';

  // 拼接好参数直接重写向到github
  await ctx.redirect(
    `https://github.com/login/oauth/authorize` +
      `?client_id=${client_id}` +
      `&scope=user` +
      `&state=${state}` +
      `&redirect_uri=${callback_url}`
  );
};
```

原链文接：[https://atjiu.github.io/2019/03/14/login-with-github-koa/](https://atjiu.github.io/2019/03/14/login-with-github-koa/)

### scope参数

说一下上面拼接的链接里的一个参数 `scope` 这个参数可取值有如下这些

- repo
- admin
- gist
- notifications
- user

它们分别有什么权限可以参见：[https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/)

其中 `admin` 的权限最大，它可以拿到Github用户的所有Repository并且对它们进行CRUD以及使用用户授权后拿到的`access_token`对其它项目进行`star`,`fork`等操作，**慎用！**

### 回调

有了这个重写向，Github就会验证参数里的client_id等参数，如果都是正常的，github就会回调申请application的时候填写的callback地址，这时就需要在网站里再写一个回调处理路由了，代码如下

```js
const axios = require('axios');

exports.callback = async (ctx) => {
  const code = ctx.request.query.code;
  const state = ctx.request.query.state;
  const _state = ctx.session.state;
  // 比较state是否一致
  if (state !== _state) {
    ctx.throw(500, new Error('非法操作'));
  } else {
    // 获取access_token
    const fetch_access_token_resp = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: config.oauth.github.client_id,
        client_secret: config.oauth.github.client_secret,
        code: code,
        redirect_uri: config.oauth.github.callback_url,
        state: state
      }, {
        headers: {
          Accept: 'application/json' // 设置headers里的Accept为 application/json ，响应的结果就是json格式的
        }
      }
    );
    // fetch_access_token_resp.data 对象里的数据长下面这个样
    // {"access_token":"172e16c7e42f292c6912e7710c838347ae178b4a", "scope":"repo,gist", "token_type":"bearer"}
    const access_token = fetch_access_token_resp.data.access_token;
    // 使用access_token请求个人信息接口，获取用户信息
    const github_user_info_resp = await axios.get(
      `https://api.github.com/user?access_token=${access_token}`
    );
    // 到这一步就完成了，可以将用户github上一些对网站有用的数据保存下来，然后用户就登录成功了
    // github_user_info_resp.data 这里获取到的用户的信息json长啥样？往下看
    ctx.body = github_user_info_resp.data;
  }
};
```

### 用户个人信息

github_user_info_resp.data 数据格式

链原文接：[https://atjiu.github.io/2019/03/14/login-with-github-koa/](https://atjiu.github.io/2019/03/14/login-with-github-koa/)

```json
{
  "login": "atjiu",
  "id": 9217170,
  "node_id": "MDQ6VXNlsjY1MTU1NzA=",
  "avatar_url": "https://avatars2.githubusercontent.com/u/6915570?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/atjiu",
  "html_url": "https://github.com/atjiu",
  "followers_url": "https://api.github.com/users/atjiu/followers",
  "following_url": "https://api.github.com/users/atjiu/following{/other_user}",
  "gists_url": "https://api.github.com/users/atjiu/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/atjiu/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/atjiu/subscriptions",
  "organizations_url": "https://api.github.com/users/atjiu/orgs",
  "repos_url": "https://api.github.com/users/atjiu/repos",
  "events_url": "https://api.github.com/users/atjiu/events{/privacy}",
  "received_events_url": "https://api.github.com/users/atjiu/received_events",
  "type": "User",
  "site_admin": false,
  "name": "朋也",
  "company": null,
  "blog": "https://atjiu.github.io",
  "location": "Shanghai",
  "email": "py2qiuse@gmail.com",
  "hireable": null,
  "bio": "hello world",
  "public_repos": 99,
  "public_gists": 99,
  "followers": 99,
  "following": 99,
  "created_at": "2014-03-11T06:26:21Z",
  "updated_at": "2019-02-28T04:51:50Z",
  "private_gists": 99,
  "total_private_repos": 99,
  "owned_private_repos": 99,
  "disk_usage": 9999,
  "collaborators": 0,
  "two_factor_authentication": true,
  "plan": {
    "name": "free",
    "space": 9999999,
    "collaborators": 0,
    "private_repos": 10000
  }
}
```

## 内网穿透

github回调的地址要保证外网能访问通的，所以配置上开发项目的地址就不行了，可以使用ngrok或者frp工具来实现内网穿透

ngrok用法

```bash
# mac上安装
brew install ngrok
# 启动代理
ngrok http 3000
```

frp用法可以参见我另一篇博客 [利用frp内网穿透实现用自家电脑发布网站(不用买服务器了)](https://atjiu.github.io/2018/10/18/frp-tutorial/)

# 总结

每次集成的时候总会忘了github返回的数据格式长啥样，这次总结一下，开发语言用的是koa，不过请求接口用什么语言都是一样的

写博客不易，转载请保留原文链接，谢谢!