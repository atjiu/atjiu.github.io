---
layout: post
title: react-native TabNavigator用法
categories: react-native学习笔记
tags: react-native TabNavigator
author: 朋也
--- 

* content
{:toc}

TabNavigator 也是`react-navigation`包下的，用法也相当简单





```js
const ITNewsTabNavigator = TabNavigator({
  Main: {
    screen: HomeComponent,
    navigationOptions: {
      title: 'IT资讯',
      headerTitle: 'IT资讯',
      tabBarLabel: "IT资讯",
      tabBarIcon: ({tintColor}) => (
        <Icon
          name="home"
          size={24}
          color={tintColor}
        />
      )
    }
  },
  User: {
    screen: UserComponent,
    navigationOptions: {
      title: '我的',
      headerTitle: '我的',
      tabBarLabel: "我的",
      tabBarIcon: ({tintColor}) => (
        <Icon
          name="user"
          size={24}
          color={tintColor}
        />
      )
    }
  }
}, {
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  swipeEnabled: false,
  animationEnabled: false,
  backBehavior: 'none',
})
```

这样就可以得到一个底部有两栏的一个布局，效果图可见 https://github.com/tomoya92/ITNews-React-Native 

**说明：**

- `tabBarComponent: TabBarBottom, tabBarPosition: 'bottom',` 这两个配置是将Android上显示在上面tabbar弄下来显示的
- `swipeEnabled: false,` 允许左右滑动切换视图，iOS上可以，Android不行
- `animationEnabled: false,` 滑动的时候动画，iOS上可以，Android不行

代码： https://github.com/tomoya92/ITNews-React-Native 
