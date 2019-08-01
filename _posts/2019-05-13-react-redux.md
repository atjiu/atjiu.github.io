---
layout: post
title: react 项目集成 react-redux 解决 state 存储与共享问题
date: 2019-05-13 21:17:00
categories: nodejs学习笔记
tags: react-redux
author: 朋也
---

* content
{:toc}

整理了一下react-redux用法, 备忘一下, 用到时看下就集成了, 方便

> redux 里涉及了两个东西, `action` `reduce` , 至于为啥叫这个名字, 我也不知道
>
> action 开发业务逻辑的, reduce是管理状态的, 它俩是通过 dispatch 对象联系上的
>
> action和reduce开发好之后, 又是通过 react-redux 中的 connect 跟组件关联上的
>
> 大致流程就是这样吧, 具体原理我也不知道, 下面介绍用法, 没有原理介绍, 想了解原理的, 可以去github上找redux开源项目看readme了解

**为啥要集成 redux 呢, 好好的 state用的不好么?**

项目大了, 嵌套深了, 通过props传值就会变的很费劲, 如果有redux帮忙管理这些state, 就方便的多了, 其实redux就是解决state存储和在组件间共享的问题(我的理解)





## 创建项目

首先创建react项目

```bash
npx create-react-app react-redux-demo
```

创建好之后, 启动

```bash
yarn start
```

## 添加功能

给项目增加一个请求接口的方法, 我这用的是axios, 请求的是 cnodejs.org 的接口, 具体代码如下

```bash
yarn add axios
```

```js
import React, { Component } from "react";
import axios from "axios";
import "./App.css";

export default class App extends Component {

  state = {
    topics: []
  };

  componentDidMount() {
    axios
      .get("https://cnodejs.org/api/v1/topics")
      .then(resp => this.setState({ topics: resp.data.data }));
  }

  render() {
    return (
      <div>
        <h1>NodeJS中文</h1>
        <ul>
          {this.state.topics.map(item => (
            <li key={item.id}>
              <div className="title">{item.title}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
```

原链文接: [https://blog.yiiu.co/2019/05/13/react-redux/](https://blog.yiiu.co/2019/05/13/react-redux/)

css

```css
.title {
  font-size: 18px;
  font-weight: 500;
  color: #222;
  line-height: 1.7;
  padding: 5px 0;
  border-bottom: 1px dashed #ccc;
}
```

运行结果

![](/assets/react-redux-demo.png)

## 添加redux

安装依赖

```bash
yarn add react-redux redux redux-logger redux-thunk
```

添加两个文件夹 `actions` `reduces`

- actions 它里面主要是写业务操作的
- reduces 它里面维护的是state

在actions里创建一个 `test.js` 文件, 添加上获取话题列表的逻辑

```js
import axios from "axios";

export function fetchTopics(page) {
  return function(dispatch) {
    axios
      .get("https://cnodejs.org/api/v1/topics?page=" + page)
      .then(resp =>
        dispatch({ type: "FETCH_TOPICS", payload: { topics: resp.data.data } })
      );
  };
}
```

然后在 reduces 里创建一个 `test.js` 用来维护 `App.js` 组件的状态, 具体代码如下

```js
export default (
  state = {
    topics: []
  },
  action
) => {
  switch (action.type) {
    case "FETCH_TOPICS":
      return {
        ...state,
        topics: action.payload.topics
      };
    default:
      return state;
  }
};
```

再在 reduces 里创建一个 `index.js` 用来管理这些 reduces

```js
import { combineReducers } from "redux";

import test from "./test";

export default combineReducers({
  app: test
});
```

在src下创建 `store.js` 文件, 用来管理 reduces

```js
import {applyMiddleware, createStore} from 'redux';

import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';

import reduce from './reduces';

const middleware = applyMiddleware(thunk, createLogger());

export default createStore(
  reduce,
  // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  middleware,
);
```

这里面还加上了日志功能

接着修改 `src/index.js` 文件, 让react项目支持 redux, 在`<App/>` 外加上 `<Provider>` 标签

```js
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

import { Provider } from "react-redux";
import store from "./store";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();
```

文原链接: [https://blog.yiiu.co/2019/05/13/react-redux/](https://blog.yiiu.co/2019/05/13/react-redux/)

最后在组件中使用, 修改 `App.js` 的代码, 先让组件跟 redux 连接起来

```js
export default connect(state => {
  return { app: state.app };
})(App);
```

然后去掉组件里的 `state`

- 调用 actions 里的方法是通过 `this.props.dispatch(actions里的方法名())`
- 使用连接好的reduce里的state方法 `this.props.app.topics`

其中 app 是在 `reduces/index.js` 里管理reduce时起的名, topics就是 `test.js` 里定义的state

App.js 完整代码如下

```js
import React, { Component } from "react";
import "./App.css";
import { connect } from "react-redux";
import { fetchTopics } from "../actions/test";

class App extends Component {
  componentDidMount() {
    this.props.dispatch(fetchTopics(1));
  }

  render() {
    return (
      <div>
        <h1>NodeJS中文</h1>
        <ul>
          {this.props.app.topics.map(item => (
            <li key={item.id}>
              <div className="title">{item.title}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect(state => {
  return { app: state.app };
})(App);
```

启动项目, 效果是一样的, 这样就可以给把不同组件的state统一管理了, 在当前组件里也可以通过连接的方式引入其它组件的state了, 方便

## 总结

上面只是介绍了用法，没有介绍原理, 其实我也不太明白, 感觉跟java后台写法差不多, 写法很固定, 照着抄就行了, 改动的地方非常少

不过它也有不好的地方, 如果网页刷新了, 存在redux里的状态数据就全没了
