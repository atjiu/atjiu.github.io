---
layout: post
title: Redux用法总结
date: 2021-04-29 09:54:00
categories: react.js学习笔记
tags: redux
author: 朋也
---

* content
{:toc}





> 本文内容整理自尚硅谷视频

## Redux原理图

![](/assets/2021-04-29-09-56-16.png)

## 简化版Redux使用案件

安装

```bash
yarn add redux
```

创建store

```js
import { createStore } from 'redux'
import countReducer from './count_reducer'

export default createStore(countReducer)
```

创建reducer

```js
const initState = 0

export default function countReducer(preState = initState, action) {
    console.log(preState, action)
    const { type, data } = action;
    switch (type) {
        case "increment":
            return preState + data;
        case "decrement":
            return preState - data;
        default:
            return preState;
    }
}
```

编写组件

```js
import React from 'react';
import store from './redux/store'

class App extends React.Component {
  increment() {
    store.dispatch({ type: "increment", data: 1 })
  }
  decrement() {
    store.dispatch({ type: "decrement", data: 1 })
  }
  componentDidMount() {
    // 因为redux只管理state，不负责渲染，所以这里通用调用subscribe()方法监听一下store里状态值的变化，然后通过调用setState()方法什么值都不改来达到更新组件的目的
    store.subscribe(() => {
      this.setState({})
    })
  }

  render() {
    return (
      <div className="App">
        <code>Count: {store.getState()}</code><br />
        <button onClick={this.increment.bind(this)}>increment</button>
        <button onClick={this.decrement.bind(this)}>decrement</button>
      </div >
    );
  }
}

export default App;
```

上面案例中用到了redux里三个api

- getState() 从store中获取状态值
- dispatch() 将事件分发下去，实现是在reducer里写的
- subscribe() store里状态只要发生变化，这个函数里的回调就会被调用

## 完整版的redux案例

添加上constant.js用于定义一些action中type的常量

```js
export const INCREMENT = "increment"
export const DECREMENT = "decrement"
```

添加上count_action.js用于定义事件对象

```js
import { INCREMENT, DECREMENT } from './constant'

export const countIncrement = data => ({ type: INCREMENT, data });
export const countDecrement = data => ({ type: DECREMENT, data });
```

组件中使用方法

```js
import { countIncrement, countDecrement } from './redux/count_action'

class App extends React.Component {
    increment() {
        store.dispatch(countIncrement(1))
    }
    decrement() {
        store.dispatch(countDecrement(1))
    }
    //...
}
```

## 异步action使用方法

当action返回的是一个对象（Object）时，它就是一个同步的action，但如果涉及到网络请求时，就属于异步操作了，同时action也要是异步的
redux规定，action返回对象是一个function时，它就是一个异步的action，写法如下

```js
import { INCREMENT, DECREMENT } from './constant'
import store from './store'

export const countIncrement = data => ({ type: INCREMENT, data });
export const countDecrement = data => ({ type: DECREMENT, data });

// 异步的action
export const countIncrementAsync = (data, time) => {
    return () => {
        setTimeout(() => {
            store.dispatch(countIncrement(data))
        }, time);
    }
}
```

调用

```js
class App extends React.Component {
    increment() {
        store.dispatch(countIncrementAsync(1, 1000))
    }
    //...
}
```

这时候运行会报错，还要借助一个中间件 redux-thunk 才能让redux支持异步action，安装 yarn add redux-thunk
将中间件配置在store.js里，写法是固定的

```js
import { createStore, applyMiddleware } from 'redux'
import countReducer from './count_reducer'
import thunk from 'redux-thunk'

export default createStore(countReducer, applyMiddleware(thunk))
```

这时候再运行就没问题了。

## react-redux原理图

![](/assets/2021-04-29-10-02-01.png)

react-redux又将组件分为UI组件与容器组件（概念是真多。。）

- UI组件：只做界面展示与逻辑处理，不与redux有半毛钱关系
- 容器组件：负责将UI组件与redux关联起来的东东
- 改造一下上面的demo

首先要安装依赖 `yarn add react-redux`

然后将App.js里所有的redux相关的代码都删了，然后创建一个Count容器组件，容器组件一般放在container目录里，名字也叫App.js

```js
import { connect } from 'react-redux'
// 引入UI组件
import AppUI from '../components/App'
// 引入actions
import { countIncrement, countDecrement, countIncrementAsync } from '../redux/count_action'

// connect()方法的第一个参数，它是将redux里的state映射到ui组件的props，然后传给ui组件使用
function mapStateToProps(state) {
    return { abc: state }
}

// connect()方法的第二个参数，它是将redux里的dispatch映射到ui组件的props，然后传给ui组件使用
function mapDispatchToProps(dispatch) {
    return {
        jia: (data) => dispatch(countIncrement(data)),
        jian: (data) => dispatch(countDecrement(data)),
        jiaAsync: (data, time) => dispatch(countIncrementAsync(data, time))
    }
}

// connect()() 方法的返回值就是ui组件
export default connect(mapStateToProps, mapDispatchToProps)(AppUI)
```

然后修改index.js里引入的App组件，现在要引入的是容器组件，然后将store传给这个容器组件

```js
import React from 'react';
import ReactDOM from 'react-dom';
// 引入容器组件，在这个容器组件里关联了UI组件
import App from './containers/App';

import store from './redux/store'

ReactDOM.render(
    <React.StrictMode>
        <App store={store} /> // 将store传给容器组件使用
    </React.StrictMode>,
    document.getElementById('root')
);

```

真正的UI组件里使用redux里的state与dispatch方法就要从props里取了

```js
import React from 'react';

class App extends React.Component {
    increment() {
        this.props.jia(1);
    }
    decrement() {
        this.props.jian(1);
    }
    incrementAsync() {
        this.props.jiaAsync(1, 1000);
    }

    render() {
        return (
            <div className="App">
                {/* <code>Count: {store.getState()}</code><br /> */}
                <code>Count: {this.props.abc}</code><br />
                <button onClick={this.increment.bind(this)}>increment</button>
                <button onClick={this.decrement.bind(this)}>decrement</button>
                <button onClick={this.incrementAsync.bind(this)}>increment async</button>
            </div >
        );
    }
}

export default App;
```

## react-redux优化写法

首先在容器组件被使用的地方要把store传进去，那么当容器组件不止一个的时候，有多少组件就发写多少次store={store}，如下

```js
return (
    <div>
        <App store={store}/>
        <App1 store={store}/>
        <App2 store={store}/>
        <App3 store={store}/>
    </div>
)
```

这样写起来就很不优雅了，react-redux里提供了一个Provider组件可以将配置在Provider上的store自动的注册到它下面所有的子组件上去，所以这时候就可以在项目的最外层的组件外给包上一层Provider组件，然后将store给传进去就行了

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import App from './containers/App';

import store from './redux/store'

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

```

容器组件里的connect()方法里的两个参数可以优化成下面样子

```js
import { connect } from 'react-redux'
// 引入UI组件
import AppUI from '../components/App'
// 引入actions
import { countIncrement, countDecrement, countIncrementAsync } from '../redux/count_action'

// connect()() 方法的返回值就是ui组件
export default connect(
    state => ({ abc: state }),
    ({
        jia: countIncrement,
        jian: countDecrement,
        jiaAsync: countIncrementAsync,
    })
)(AppUI)
```

一个组件用上react-redux后，还要拆成两个组件（ui组件，容器组件）就太麻烦了，这两个组件也是可以合并的

```js
import React from 'react';
import { connect } from 'react-redux'
// 引入actions
import { countIncrement, countDecrement, countIncrementAsync } from '../redux/count_action'

function App(props) {
    console.log(props);
    function increment() {
        props.jia(1)
    }
    function decrement() {
        props.jian(1)
    }
    function incrementAsync() {
        props.jiaAsync(1, 1000)
    }
    return (
        <div className="App">
            <code>Count: {props.abc}</code><br />
            <button onClick={increment}>increment</button>
            <button onClick={decrement}>decrement</button>
            <button onClick={incrementAsync}>increment async</button>
        </div >
    );
}

// connect()() 方法的返回值就是ui组件
export default connect(
    state => ({ abc: state }),
    ({
        jia: countIncrement,
        jian: countDecrement,
        jiaAsync: countIncrementAsync,
    })
)(App)
```

甚至于如果将mapDispatchToProps中的方法名写成跟action中一样的话，可以简写如下

```js
export default connect(
    state => ({ abc: state }),
    ({
        countIncrement,
        countDecrement,
        countIncrementAsync,
    })
)(App)
```

继续简化，如果connect()方法的第二个参数不传，那么react-redux会默认将dispatch方法添加到props上，调用时就要用 props.dispatch(xxx()) 来写了

```js
function App(props) {
    console.log(props);
    function increment() {
        props.dispatch(countIncrement(1))
    }
    function decrement() {
        props.dispatch(countDecrement(1))
    }
    function incrementAsync() {
        props.dispatch(countIncrementAsync(1, 1000))
    }
    return (
        <div className="App">
            <code>Count: {props.abc}</code><br />
            <button onClick={increment}>increment</button>
            <button onClick={decrement}>decrement</button>
            <button onClick={incrementAsync}>increment async</button>
        </div>
    );
}

export default connect(
    state => ({ abc: state })
)(App)
```

既然第二个参数能省，那么第一个参数state能不能省呢？不行

当有多个组件时，每个组件都对应的有一个reducer，一个action的时候，这时候就要分文件夹管理了，当有多个reducer的时候，可以借助redux里的combineReducers()方法把这些reducer给集中管理起来，然后再一次性的传给createStore()方法

```js
import { createStore, applyMiddleware, combineReducers } from 'redux'
import countReducer from './reducers/count'
import personReducer from './reducers/person'
import thunk from 'redux-thunk'

const allReducers = combineReducers({
    count: countReducer,
    persons: personReducer
})

export default createStore(allReducers, applyMiddleware(thunk))
```

当有多个组件时，在两个不相干的组件中使用对方的状态数据时，可以在connect()方法里声明，比如在Author组件里还想展示当前作者写的书的数据，那么就要用到Books组件里的数据了，可以通过下面方法拿到对方的状态数据

```js
export default connect(state => ({ author: state.author, books: state.books }))(Author);
```

## 浏览器redux插件配置

react开发有对应的插件，redux也有，不过不像react插件那么方便，redux要在代码里配置一下才能在浏览器里让插件生效
首先安装，地址: [Redux DevTools - Chrome 网上应用店 (google.com)](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd/related?hl=zh-CN)

然后安装依赖 `yarn add redux-devtools-extension`

最后修改store.js里的createStore()代码

```js
import { createStore, applyMiddleware, combineReducers } from 'redux'
import countReducer from './reducers/count'
import personReducer from './reducers/person'
import thunk from 'redux-thunk'
// 引入工具依赖
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

const allReducers = combineReducers({
    count: countReducer,
    persons: personReducer
})

// 放在中间件的参数位置，如果有其它中间件，就当参数传给composeWithDevTools()
export default createStore(allReducers, composeWithDevTools(applyMiddleware(thunk)))
```
