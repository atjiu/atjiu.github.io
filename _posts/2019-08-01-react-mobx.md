---
layout: post
title: 在create-react-app项目里集成mobx
date: 2019-08-01 11:26:00
categories: react.js学习笔记
tags: mobx
author: 朋也
---

* content
{:toc}

> 公司项目里出现了一个大量表单的页面，结果各种操作都卡的不行，然后在大佬的帮助下，发现mobx可以只针对对象中的某个属性进行监听，如果发生变化后，更新也只更新它观察的那个属性，不会是一整个大对象的更新，这就将性能一下提升上来了，为了性能只能折腾一下mobx了
>
> 关于redux的用法可以查阅我另一篇博客 [react 项目集成 react-redux 解决 state 存储与共享问题](https://atjiu.github.io/2019/05/13/react-redux/)

下面来介绍一下mobx的`非装饰器用法`，`装饰器用法`，以及`拆分store`






## 创建项目

```bash
npx create-react-app mobx-demo
```

安装mobx相关依赖

```bash
yarn add mobx mobx-react
```

## 装饰器

mobx里常用的装饰器有3个 `observable` `action` `computed`

让react组件能被监听的装饰器是 mobx-react 依赖里的 `observer`

有了这四个装饰器就可以集成了

## 非@用法

如果你的项目是typescript，那推荐使用 `@` 来使用装饰器，因为它简单，但如果你的项目是js开发的话，那么直接在项目里用 `@` 会报错，这个解决办法下面介绍

不用 `@` 的话，mobx里还提供了一个工具类 `decorate` ，用它也可以实现相同的功能，只是代码上写起来就要累赘多了

创建一个store

```js
import { observable, decorate } from 'mobx';

class Store {
  data = [];
}

// 将data标为被观察状态，这样在data有变动的时候，组件里才会更新，相当于react里调用了 setState()
decorate(Store, {
  data: observable
})

export default new Store();
```

然后通过 `props` 传递给组件

```js
import Store from './store/store';

ReactDOM.render(<App store={Store} />, document.getElementById('root'));
```

在组件里就可以通过 `this.props.store` 来取出数据了

```js
class App extends React.Component {
  render() {
    const { data } = this.props.store;
    return <div className="App">
      <h1 className="App">Hello world</h1>
      data length: {data.length}
    </div>
  }
}
```

现在给store里添加一个方法，可以往 `data` 对象里添加数据的方法，这时候就要用到`action`来修饰了

```js
import { observable, action, decorate } from 'mobx';

class Store {
  data = [];
  add() {
    this.data.push(1);
  }

}

decorate(Store, {
  data: observable,
  add: action.bound
})
```

组件中调用

```js
class App extends React.Component {

  render() {
    const { data, add } = this.props.store.item;
    return <div>
      <p><button onClick={() => add()}>click</button></p>
      data length: {data.length}
    </div>
  }

}
```

链接文原: [https://atjiu.github.io/2019/08/01/react-mobx/](https://atjiu.github.io/2019/08/01/react-mobx/)

现在点击button，会发现data length没有变化，这是因为react组件没有跟mobx关联进来，这时候就要用到 `mobx-react` 中的装饰器了 `observer`

将组件包裹在 observer 里就可以了

```js
import { observer } from 'mobx-react';

const App = observer(class App extends React.Component {

  render() {
    const { data, add } = this.props.store.item;
    return <div>
      <p><button onClick={() => add()}>click</button></p>
      data length: {data.length}
    </div>
  }

})
```

对于一些计算型的方法，可以使用js中的 get 来处理，然后使用 computed 装饰就可以在多个组件间共用了，比如计算数组的长度

```js
import { observable, action, computed, decorate } from 'mobx';

class Store {
  data = [];
  add() {
    this.data.push(1);
  }
  get count() {
    return this.data.length;
  }
}

decorate(Store, {
  data: observable,
  add: action.bound,
  count: computed
})
```

在组件中直接调用get方法即可

```js
import { observer } from 'mobx-react';

const App = observer(class App extends React.Component {

  render() {
    const { data, add, count } = this.props.store.item;
    return <div>
      <p><button onClick={() => add()}>click</button></p>
      data length: {count}
    </div>
  }

})
```

## @用法

上面demo可以发现，每写一个属性或者方法都需要使用 decorate 声明一下，这样很容易就忘了，下面来介绍一下 `@` 用法

安装三个依赖

```bash
yarn add @babel/plugin-proposal-decorators customize-cra react-app-rewired
```

然后将 `package.json` 文件中的启动脚本修改一下, 将 `react-scripts` 换成 `react-app-rewired`

```json
"scripts": {
  "start": "react-app-rewired start",
  "build": "react-app-rewired build",
  "test": "react-app-rewired test",
  "eject": "react-app-rewired eject"
},
```

Store修改如下

```js
import { observable, action, computed } from 'mobx';

class Store {
  @observable data = [];
  @action.bound add() {
    this.data.push(1);
  }
  @computed get count() {
    return this.data.length;
  }
}
```

组件中也不用使用 `observer` 包裹组件了，直接在组件上面加上一个 `@observer` 即可

```js
import { observer } from 'mobx-react';

@observer
class App extends React.Component {

  render() {
    const { data, add, count } = this.props.store.item;
    return <div>
      <p><button onClick={() => add()}>click</button></p>
      data length: {count}
    </div>
  }

}
```

重启服务即可

如果用vscode开发的话，会有个蛋疼的问题，服务启动是没有问题的，但vscode里对代码有报错，这强迫症不能忍呀，还好有解决办法

在项目根目录下创建文件 `jsconfig.json`, 写上下面内容即可

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Store的拆分

上面demo可以发现所有组件的数据都放在Store里，这样如果项目大的话，不太好，下面介绍一下拆分方法

创建对应组件的 Store，如下

```js
import { observable, action, computed } from 'mobx';

class Topic {
  @observable data = [];

  @action.bound add() {
    this.data.push(1);
  }

  @computed get count() {
    return this.data.length;
  }
}

export default Topic;
```

然后在 `store.js` 引入，将 Topic 作为 Store 的一个成员变量

```js
import Topics from './topics';

class Store {
  topics = new Topics(); // 这里要初始化
}

export default new Store();
```

在组件里引入 Topic 的数据或者方法也就多点一层就可以了

```js
const { topics } = this.props.store;

// topics.data
// topics.add
// topics.count
```

## 参考

- [https://medium.com/@michielsikma/adding-decorator-support-to-create-react-app-projects-using-react-app-rewired-df48e7ffd636](https://medium.com/@michielsikma/adding-decorator-support-to-create-react-app-projects-using-react-app-rewired-df48e7ffd636)
- [https://stackoverflow.com/questions/42214814/remove-decorators-error-in-visual-studio-code](https://stackoverflow.com/questions/42214814/remove-decorators-error-in-visual-studio-code)