---
layout: post
title: react-native组件StackNavigator
categories: react-native学习笔记
tags: react-native StackNavigator
author: 朋也
---

* content
{:toc}

之前一篇文章介绍了[使用NavigatorIOS组件结合ListView的使用](https://tomoya92.github.io/2017/08/02/react-native-navigatorios-listview/)，但那个只能用在IOS系统上，在Android上就没法用了，所以找到了StackNavigator组件





## 安装

```txt
yarn add react-navigation
```

## 改造项目

因为要一份代码可以运行两个平台，所以这里处理一下 `index.android.js`和`index.ios.js`文件

新建一个文件 `App.js`， 内容如下

```javascript
import React, {Component} from 'react';
import {
  AppRegistry, Image, ListView, StyleSheet,
  Text, TouchableHighlight, View,
} from 'react-native';
import {StackNavigator} from 'react-navigation';

import CNodeJSList from './components/CNodeJSList';
import OSChinaList from './components/OSChinaList';
import ToutiaoList from './components/ToutiaoList';
import TuiCoolList from './components/TuiCoolList';
import SegmentFaultList from './components/SegmentFaultList';
import ZhihuDailyList from "./components/ZhihuDailyList";
import NewsDetail from "./components/NewsDetail";

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class HomeScreen extends Component {
  static navigationOptions = {
    title: 'IT资讯',
  };

  constructor(props) {
    super(props);
    this.state = ({
      dataSource: ds.cloneWithRows([{
        name: 'CNodeJS',
        logo: require('./images/cnode.png')
      }, {
        name: '开源中国',
        logo: require('./images/oschina.png')
      }, {
        name: '开发者头条',
        logo: require('./images/toutiaoio.png')
      }, {
        name: '推酷',
        logo: require('./images/tuicool.png')
      }, {
        name: 'SegmentFault',
        logo: require('./images/segmentfault.png')
      }, {
        name: '知乎日报',
        logo: require('./images/zhihudaily.png')
      }]),
    });
  }

  _onPress(rowData) {
    const {navigate} = this.props.navigation;
    if (rowData === 'CNodeJS') {
      navigate('CNodeJS', {
        name: rowData,
      })
    } else if (rowData === '开源中国') {
      navigate('OSChina', {
        name: rowData,
      })
    } else if (rowData === '开发者头条') {
      navigate('TouTiao', {
        name: rowData,
      })
    } else if (rowData === '推酷') {
      navigate('TuiCool', {
        name: rowData,
      })
    } else if (rowData === 'SegmentFault') {
      navigate('SegmentFault', {
        name: rowData,
      })
    } else if (rowData === '知乎日报') {
      navigate('ZhihuDaily', {
        name: rowData,
      })
    }
  }

  render() {
    return <ListView
      style={styles.listView}
      dataSource={this.state.dataSource}
      renderRow={(rowData) =>
        <TouchableHighlight
          style={styles.rowStyle}
          underlayColor='#008b8b'
          onPress={() => this._onPress(rowData.name)}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image style={{width: 40, height: 40, borderRadius: 4}} source={rowData.logo}/>
            <Text style={styles.rowText}>{rowData.name}</Text>
          </View>
        </TouchableHighlight>}
    />
  }
}

const styles = StyleSheet.create({
  listView: {
    backgroundColor: '#eee',
  },
  rowText: {
    marginLeft: 10,
    fontSize: 18,
    flex: 1,
  },
  rowStyle: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 1,
  },
});

const ITNews = StackNavigator({
  Home: {screen: HomeScreen},
  CNodeJS: {screen: CNodeJSList},
  OSChina: {screen: OSChinaList},
  TouTiao: {screen: ToutiaoList},
  TuiCool: {screen: TuiCoolList},
  SegmentFault: {screen: SegmentFaultList},
  ZhihuDaily: {screen: ZhihuDailyList},
  NewsDetail: {
    screen: NewsDetail,
  },
});

AppRegistry.registerComponent('ITNews', () => ITNews);
```

然后将 `index.android.js`和`index.ios.js` 里的内容都改成

```javascript
import './App';
```

这样直接一次修改`App.js`就可以在两个平台上运行了

## StackNavigator用法

StackNavigator是将所有的组件都组织起来，用到哪个直接拿就可以了，不只限于当前文件可以用，在其它文件里都可以直接使用的

```javascript
const ITNews = StackNavigator({
  Home: {screen: HomeScreen},
  CNodeJS: {screen: CNodeJSList},
  OSChina: {screen: OSChinaList},
  TouTiao: {screen: ToutiaoList},
  TuiCool: {screen: TuiCoolList},
  SegmentFault: {screen: SegmentFaultList},
  ZhihuDaily: {screen: ZhihuDailyList},
  NewsDetail: {
    screen: NewsDetail,
  },
});
```

用的时候是根据配置的名字来用的，就比如 `CNodeJS: {screen: CNodeJSList},`用的时候直接写 `CNodeJS`就可以了

```javascript
navigate('CNodeJS', { //这里的CNodeJS就是在StackNavigator里定义的
  name: rowData,
})
```

## 在TITLE上添加图标

```javascript
static navigationOptions = ({navigation}) => ({
    title: `${navigation.state.params.title}`,
    headerRight: <Icon
      name="share-alt"
      size={18}
      color="#000"
      style={{paddingRight: 20}}
      onPress={() => {
        Share.share({
          message: navigation.state.params.title + ' \r\n' + navigation.state.params.href + ' \r\n' + '分享来自ITNews'
        })
          .then(() => {
          })
          .catch((error) => console.log(error.message));
      }}
    />
  });
```

上面的代码还要安装`react-native-vector-icons`依赖，可以先把`<Icon/>`组件替换成`<Text/>`来看下效果

## 传值和取值

StackNavigator传值很简单

```
navigate('CNodeJS', {
  name: rowData, //这里就是要传的值
})
```

取值麻烦一点，不能用`this.props.name`来取，而要用`this.props.navigation.state.params.title`来取值

```javascript
this.state = ({
  height: 0,
  refreshing: true,
  title: this.props.navigation.state.params.title,
  href: this.props.navigation.state.params.href,
});
```

## 参考

- [Hello Mobile Navigation](https://reactnavigation.org/docs/intro/)
- [StackNavigator](https://reactnavigation.org/docs/navigators/stack)

源码：[https://github.com/tomoya92/ITNews-React-Native](https://github.com/tomoya92/ITNews-React-Native)