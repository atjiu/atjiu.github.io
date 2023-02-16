---
layout: post
title: 使用parcel开发组件化的前端项目（不借助前端三大框架）
date: 2020-04-17 10:26:00
categories: javascript学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}

> 本篇博客内容来自视频 https://www.youtube.com/watch?v=8rD9amRSOQY

Parcel官网：https://parceljs.org/

在官网上描述上写到：`Blazing fast, zero configuration web application bundler`

其它的单词我不认识，这个 `zero configuration` 引起了我的注意





## 写在前面

现在用react, vue, angular开发前端项目都有他们相应的脚手架，或者 `cli` 也都可以做到一键创建项目，不过 parcel 号称 0配置，我跟着视频尝试写了一下，确实0配置，非常的简单，总结一下，以后说不写啥时候能用的上

## 创建项目（添加依赖）

简单的nodejs项目即可，使用 `npm init` 初始化项目，生成一个 `package.json` 文件

然后安装依赖

```bash
npm i -D parcel-bundler sass @babel/core @babel/plugin-transform-runtime @babel/runtime-corejs2
```

> 说明：项目中要使用高阶js语法，所以还是要借助babel编译，sass是方便写样式的，主要还是 `parcel-bundler`

安装成功后，就可以创建对应的项目结构了，类似于 create-react-app 初始化的项目一样，有 `public` `src`

在public文件夹下添加上 `index.html` 文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>

</head>
<body>
    <h1>Hello world</h1>

    <script src="../src/app.js"></script>
</body>
</html>
```

引入了一个 `src/app.js` 文件，创建它

```js
console.log("hello world");
```

修改 `package.json` 文件里的命令

文接链原: [https://atjiu.github.io/2020/04/17/parcel-tutorial/](https://atjiu.github.io/2020/04/17/parcel-tutorial/)

```
  "scripts": {
    "dev": "rm -rf ./development && rm -rf ./.cache && parcel public/index.html --out-dir development -p 3000",
    "build": "parcel build public/index.html --out-dir dist --public-url ./"
  },
```

最后添加babel的配置，在项目根目录里创建文件 `.babelrc`，添加上下面内容

```json
{
    "plugins": [
      [
        "@babel/plugin-transform-runtime",
        {
          "corejs": 2,
          "regenerator": true
        }
      ]
    ]
  }
```

运行项目 `npm run dev` 浏览器访问 http://localhost:3000

## 添加组件

首先给页面上添加一个Header，创建Header组件

src/components/Header.js

```js
const Header = () => {
    const template = `
        <header>
            <h1>My Parcel App</h1>
            <p>This is a boilerplate for a simple JS workflow using parcel</p>
        </header>
    `;

    return template;
}

export default Header;
```

修改index.html

```html
<body>
    <div class="container">
        <div id="header"></div>
        <div id="user"></div>
    </div>

    <script src="../src/app.js"></script>
</body>
```

添加样式 src/scss/app.scss

```css
$primary-color: slateblue;

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    background: $primary-color;
    color: #ffffff;
    line-height: 1.5;
}

ul {
    list-style: none;
}

.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

header {
    text-align: center;
    margin-bottom: 40px;
    background: rgba(0,0,0,0.3);
    padding: 30px;
    border-bottom: 5px #fff solid;
}
```

修改 app.js

链文接原: [https://atjiu.github.io/2020/04/17/parcel-tutorial/](https://atjiu.github.io/2020/04/17/parcel-tutorial/)

```js
import './scss/app.scss';

import Header from './components/Header';

const app = async () => {
    document.getElementById("header").innerHTML = Header();
}

app();
```

刷新页面可以看到

![](/assets/20200417113955.png)

-------

下面来添加User组件

> 介绍一个随机生机用户信息的开放接口 https://randomuser.me/api

要请求接口，安装 axios

```bash
npm i axios
```

创建组件 src/components/User.js

```js
import axios from 'axios';

const User = async () => {
    const res = await axios.get('https://randomuser.me/api')
    const user = res.data.results[0];

    const template = `
        <div class="card">
            <img src="${user.picture.large}"/>
            <div class="card-body">
                <h1>${user.name.first} ${user.name.last}</h1>
                <ul>
                    <li>${user.email}</li>
                    <li>${user.phone}</li>
                    <li>${user.location.city}</li>
                </ul>
            </div>
        </div>
    `;

    return template;
}

export default User;
```

修改 app.js,将User组件引入进来并加载到页面上

```js
import './scss/app.scss';

import Header from './components/Header';
import User from './components/User';

const app = async () => {
    document.getElementById("header").innerHTML = Header();
    document.getElementById("user").innerHTML = await User();
}

app();
```

最后再添加上相应的css src/scss/_card.scss

```css
.card {
    display: flex;
    flex-direction: column;
    color: #333;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    background: #fff;
    border-radius: 20px;
    overflow: hidden;

    img {
        width: 100%;
        object-fit: cover;
    }

    .card-body {
        padding: 30px;

        h1 {
            margin-bottom: 10px;
        }

        li {
            line-height: 2;
            border-bottom: #ccc solid 1px;
        }

        li:last-child {
            border: 0;
        }
    }
}
```

将 _card.scss 引入到 app.scss 里让其生效 **放在app.scss内容的最上面**

```css
@import "./card";
```

再次刷新页面

![](/assets/20200417114405.png)

## 打包

```bash
npm run build
```

运行命令后，会在 dist 文件夹里生成对应的静态文件，使用nginx部署一下即可访问了

## 总结

parcel开发SPA(single-page application)确实非常方便的，不知道有没有好用的前端路由组件，如果有的话，配合着一块使用，应该会非常的方便
