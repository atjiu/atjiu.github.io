---
layout: post
title: react-native组件NavigatorIOS与ListView结合使用
categories: react-native学习笔记
tags: react-native NavigatorIOS ListView
date: 2017-08-02 09:30:30
author: 朋也
---

* content
{:toc}

- [react-native组件NavigatorIOS与ListView结合使用](https://tomoya92.github.io/2017/08/02/react-native-navigatorios-listview/)
- [react-native ListView组件点击跳转](https://tomoya92.github.io/2017/08/02/react-native-listview-forward/)
- [react-native ListView下拉刷新上拉加载实现](https://tomoya92.github.io/2017/08/02/react-native-listview-refresh-loadmore/)
- [react-native组件StackNavigator](https://tomoya92.github.io/2017/08/07/react-native-stacknavigator/)
- [react-native TabNavigator用法](https://tomoya92.github.io/2017/09/06/react-native-tabnavigator/)

先看效果

![Simulator Screen Shot 2017年8月2日 09.47.12](/assets/Simulator Screen Shot 2017年8月2日 09.47.12.png)





## 使用方法

index.ios.js

```javascript
import React, {Component} from 'react';
import {
  AppRegistry,
  NavigatorIOS
} from 'react-native';

import NewsList from './components/NewsList';
export default class ITNews extends Component {
  render() {
    return (
      <NavigatorIOS
        style={{flex: 1}}
        initialRoute={{
          component: NewsList,
          title: 'IT资讯'
        }}
      />
    );
  }
}
```

NewsList.js

```javascript
import React, {Component} from 'react';
import {ListView, Text, StyleSheet, TouchableHighlight} from 'react-native';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class NewsList extends Component {

  constructor(props) {
    super(props);
    this.state = ({
      dataSource: ds.cloneWithRows(['CNodeJS', '开源中国', '开发者头条', '推酷', 'SegmentFault', 'IT之家', 'V2EX', '知乎日报', 'W3CPlus']),
    });
  }

  _onPress(rowData) {
    console.log(rowData);
  }

  render() {
    return <ListView
      style={styles.listView}
      dataSource={this.state.dataSource}
      renderRow={(rowData) =>
        <TouchableHighlight
          style={styles.rowStyle}
          underlayColor='#008b8b'
          onPress={() => this._onPress(rowData)}>
          <Text style={styles.rowText}>{rowData}</Text>
        </TouchableHighlight>}
    />
  }
}

const styles = StyleSheet.create({
  listView: {
    backgroundColor: '#eee',
  },
  rowText: {
    padding: 10,
    fontSize: 18,
    backgroundColor: '#FFFFFF'
  },
  rowStyle: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
  },
});
```

**说明**

- NavigationIOS必须要加上style={{flex: 1}}这个样式，否则它里面装载的组件不会显示

## 参考

- [ListView](http://facebook.github.io/react-native/docs/listview.html)
- [NavigatorIOS](http://facebook.github.io/react-native/docs/navigatorios.html)

源码：[https://github.com/tomoya92/ITNews-React-Native](https://github.com/tomoya92/ITNews-React-Native)