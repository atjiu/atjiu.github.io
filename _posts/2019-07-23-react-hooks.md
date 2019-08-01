---
layout: post
title: React Hooks 是什么？怎么用？
date: 2019-07-23 14:07:00
categories: react.js学习笔记
tags: react.js
author: 朋也
---

* content
{:toc}

> react又折腾出了个新玩意 `react hooks`，虽然是很早之间就发布了，最近了解了一下这货是干啥的，总结一下

**react hooks 这货是什么？**

说白了，就是拿`function`当组件用，因为之间用react定义组件用的是`class`关键字，人家嫌麻烦，代码量太大，就折腾了这货，直接一个 function 就是一个组件。。

那么，原来用 class 定义的组件里可以写state，有生命周期，这货一个function怎么实现那些功能呢？

下面就来介绍一下人家是怎么在function里处理state和生命周期的







## useState

这个hook就是state，从它里面可以声明组件里要用到的state，举个例子

class写法

```js
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
  render() {
    return <div>{count}</div>;
  }
}
```

hook 写法

```js
function Example() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>
}
```

简单吧，声明一个state，就要附带着一个 setXXX ，这就相当于 `setState()`， 比如这里声明的是 `count` 那么想更新值就要声明一个 `setCount` 变量（它也是一个方法），通过 `setCount(1);` 更新count的值后，组件就会重新渲染

`useState()` 方法中的参数是默认值的意思，上面count我想让它是个int类型的值，就给了个默认值为0，这次声明了个data，我想让它是个数组，就给了个[]

更新state，如下例子

```js
function Example() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>clicked {count}</button>
    </div>
  );
}
```

当然如果不想直接在onClick事件里调用 setCount 方法，想自定义方法来更新count的值，也可以在这个function组件里再定义一个方法来处理

```js
function Example() {
  const [count, setCount] = useState(0);

  const updateCount = function() {
    setCount(count + 1);
  };

  return (
    <div>
      <button onClick={() => updateCount()}>clicked {count}</button>
    </div>
  );
}
```

怎么在useState里声明多个变量呢？

```js
function Example() {
  const [state, setState] = useState({
    count: 0,
    data: [1, 2, 3]
  });

  const updateCount = function() {
    setState({ ...state, count: state.count + 1 });
  };

  return (
    <div>
      <ul>
        {state.data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={() => updateCount()}>clicked {state.count}</button>
    </div>
  );
}
```

## useReducer

除了从 useState 里声明state外，还可以用另一个hook `useReducer`，用法类似于 redux 里的 reducer

```js
function Example() {
  const [count, dispatch] = useReducer((count, { type, action }) => {
    switch (type) {
      case "update":
        return action.payload;
      default:
        break;
    }
  }, 0);

  return (
    <div>
      <button
        onClick={() =>
          dispatch({ type: "update", action: { payload: count + 1 } })
        }
      >
        clicked {count}
      </button>
    </div>
  );
}
```

相同的 useReducer 最后一个参数也是默认值, 通过dispatch方法传入类型然后修改state

链接文原: [https://blog.yiiu.co/2019/07/23/react-hooks/](https://blog.yiiu.co/2019/07/23/react-hooks/)

那么如何在 useReducer 里声明多个变量呢？

```js
function Example() {
  const [state, dispatch] = useReducer(
    (state, { type, action }) => {
      switch (type) {
        case "update":
          return { ...state, count: state.count + 1 };
        case "add":
          return { ...state, data: [...state.data, action.payload + 1] };
        default:
          break;
      }
    },
    { count: 0, data: [1, 2, 3] }
  );

  return (
    <div>
      <ul>
        {state.data.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: "update" })}>
        clicked {state.count}
      </button>
      <button
        onClick={() =>
          dispatch({ type: "add", action: { payload: state.data.length } })
        }
      >
        add
      </button>
    </div>
  );
}
```

## useEffect

开发过react组件的人都知道，react组件里有很多生命周期，这些生命周期在 function 组件里是怎么实现的呢？这时就要用到 `useEffect` 了

首先是 `componentDidMount` 和 `componentDidUpdate` 两个生命周期，它俩在function组件里的实现如下

```js
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("hello world");
  });

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>clicked {count}</button>
    </div>
  );
}
```

上面代码运行后，可以看到浏览器的console里会打印出 `hello world` 这个打印就相当于是 `componentDidMount` 被执行了

点击button，count每次都会变化，也就是说state一直在变，然后会发现浏览器的 console 里会随着button点击后count变化也会打印 `hello world` 这时候就相当于 `componentDidUpdate` 在执行，每次state有变动的时候，`useEffect` 都会执行一次

那有没有办法不让它执行呢？有！

`useEffect` 有两个参数，第一个参数是个函数，第二个参数相当于条件，看一下面的例子

```js
function Example() {
  const [state, setState] = useState({ count: 0, data: [1, 2, 3] });

  useEffect(() => {
    console.log("hello world");
  }, [state.count]);

  return (
    <div>
      <ul>
        {state.data.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button onClick={() => setState({ ...state, count: state.count + 1 })}>
        clicked {state.count}
      </button>
      &nbsp;
      <button onClick={() => setState({ ...state, data: [...state.data, state.data.length + 1] })}>add</button>
    </div>
  );
}
```

当页面渲染完后，浏览器console里会有一个 `hello world`输出，可以看见我在 `useEffect` 的第二个参数上加了个参数 `state.count` 这时候它就会以 `state.count` 为校验目标，只有当 state中的count有变化时，useEffect 里的第一个参数（函数）才会执行

也就是说当点击第二个按钮的时候，state更新的只是data变量，count变量没有变化，useEffect里的第一个函数参数就不会执行，这第二个参数也就相当于是 `shouldComponentUpdate` 这个生命周期了

最后再说一下组件卸载时的生命周期 `componentWillUnmount`, 要在function组件里实现这个功能也很简单，只需要在 `useEffect` 里返回一个函数就可以了

```js
function Example() {
  const [show, setShow] = useState(false);
  return (
    <div className="App">
      {show ? null : <Item />}
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <button onClick={() => setShow(!show)}>show/hidden</button>
    </div>
  );
}

function Item() {
  useEffect(() => {
    console.log("子组件加载");
    // 返回的函数名无所谓，可以随便起
    return function bye() {
      console.log("子组件卸载");
    };
    // return () => {  // 可以写成匿名函数
    //   console.log("子组件卸载");
    // };
  });
  return <div>我是子组件</div>;
}
```

当点击按钮时，子组件会交替的显示和不显示，也就意味着子组件在交替的加载和卸载，在浏览器的console里就可以看到 `子组件加载` 和 `子组件卸载` 的日志

## 父子组件传值

function组件里父子组件传值很简单，因为它本身就是 function，所以传的值就是方法的参数，如下

```js
function App() {
  const [data, setData] = useState([1, 2, 3]);
  return (
    <div className="App">
      <Item items={data} />
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <button onClick={() => setData([...data, data.length + 1])}>add</button>
    </div>
  );
}

function Item({ items }) {
  useEffect(() => {
    console.log("子组件加载");
    // 返回的函数名无所谓，可以随便起
    return function bye() {
      console.log("子组件卸载");
    };
    // return () => {  // 可以写成匿名函数
    //   console.log("子组件卸载");
    // };
  });
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

## 参考

- [http://react.html.cn/docs/hooks-effect.html](http://react.html.cn/docs/hooks-effect.html)
- [https://reactjs.org/docs/hooks-effect.html](https://reactjs.org/docs/hooks-effect.html)
