---
layout: post
title: react-router简单使用方法
date: 2017-03-08 13:41:36
categories: react.js学习笔记
tags: react.js react-router
author: 朋也
---

* content
{:toc}

react-router版本 v4.x

跟着官网 https://reacttraining.com/react-router/ 上的example学习的

## 使用

```js
<Router>
    <header>
        <ul>
            <li><Link to='/home'>Home</Link</li>
            <li><Link to='/about'>About</Link</li>
            <li><Link to='/login'>Login</Link</li>
            <li><Link to='/register'>Register</Link</li>
        </ul>
    </header>
    <section>
        <Route path='/home' component={Home}/>
        <Route path='/about' component={About}/>
        <Route path='/login' component={Login}/>
        <Route path='/register' component={Register}/>
    </section>
    <footer>
        balabalabala...
    </footer>
</Router>
```





说明：当点击Link的时候，对应到Route里就显示对应的组件，section里的Route是替换的实现，也就是说，当点击/home的时候，页面section部分就只显示Home组件的内容

## 传值

假如，点击List里的项，要传ID到Detail里，这时候就可以用下面的方法来实现

```js
<Route path='/detail/:id' render={(match) => (<Detail xxId={match.params.id}/>)}/>
```

Detail.jsx

```js
class Detail extends React.Component {
    render() {
        console.log(this.props.xxId); //可以输出List里点击传过来的值
        return (<div></div>)
    }
}
```

在V4里只能通过路由地址传值了，想传更多的值，可以借用localStorage来传

## 非Link跳转

```js
import {withRouter} from 'react-router-dom';

class ComponentA extends React.Component {
  //...
  _clickHandler() {
    this.props.history.push('/login');
  }
}

export default withRouter(ComponentA);
```

## 路由返回

```js
<div onClick={()=>this.props.history.goBack()}>返回</div>
```

## v2,v3里的跳转，返回和传值

跟v4里有些不同，下面是v2,v3里的写法

```js
import {withRouter} from 'react-router';

class ComponentA extends React.Component {
  //...
  _clickHandler() {
    this.context.router.push('/login')
  }
  _goBackHandler() {
    this.context.router.goBack();
  }
}

ComponentA.contextTypes = {
  router: PropTypes.object.isRequired
};

export default withRouter(ComponentA);
```

从路由中取值：

```js
//路由定义
<Route path='/article/:id' component={Detail}/>

//在Detail组件里取值
const {id} = this.props.params;
```

## 问题

当从List点击去到Detail里之后，再点击浏览器的返回按钮，List组件的状态就没有了，还不知道是什么原因

补充：这个问题可以通过React-Router(v2,v3)+React-Router-Scroll来解决，详见博客：[https://tomoya92.github.io/2017/09/06/reactjs-router-scroll/](https://tomoya92.github.io/2017/09/06/reactjs-router-scroll/)
