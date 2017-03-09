---
layout: post
title:  "react-router简单使用方法"
date:   2017-03-08 13:41:36
categories: react学习
tags: react react-router
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

## 问题

当从List点击去到Detail里之后，再点击浏览器的返回按钮，List组件的状态就没有了，还不知道是什么原因


