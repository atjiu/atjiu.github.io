---
layout: post
title: react-native ListView下拉刷新上拉加载实现
categories: react-native学习笔记
tags: react-native ListView
date: 2017-08-02 14:12:30
author: 朋也
---

* content
{:toc}

先看效果图

![20170802142318](https://tomoya92.github.io/assets/20170802142318.gif)





## 下拉刷新

React Native提供了一个组件可以实现下拉刷新方法`RefreshControl`

使用方法

```javascript
<ListView
  refreshControl={
    <RefreshControl
      refreshing={this.state.refreshing}
      onRefresh={this._onRefresh.bind(this)}
    />
  }
  //...
</ListView>
```

在视图加载的时候的时候，将refreshing设置为true，数据加载完成设置为false即可

## 上拉加载

利用ListView里的`onEndReached`方法实现，ListView在滚动到最后一个Cell的时候,会触发onEndReached方法

先在ListView里添加一个Footer

```js
render() {
    const FooterView = this.state.loadMore ?
      <View style={styles.footer}>
        <Text style={{fontSize: 16, color: '#777'}}>加载更多...</Text>
      </View> : null;
    return <ListView
      refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)}
        />
      }
      style={[styles.listView]}
      dataSource={ds.cloneWithRows(this.state.dataSource)}
      enableEmptySections={true}
      renderRow={this._renderRow.bind(this)}
      onEndReachedThreshold={5}
      onEndReached={this._onEndReached.bind(this)}
      renderFooter={() => FooterView}
    />
  }
```

在方法`_onEndReached`里将Footer显示出来，在数据加载完成之后，再隐藏掉Footer

```javascript
_onEndReached() {
    this.setState({
      loadMore: true,
      pageNo: this.state.pageNo + 1
    });
    this._fetchData();
  }
```

**说明**

- ListView里还设置了一个参数`onEndReachedThreshold`这个参数与`onEndReached`配合使用，它的意思是：像素的临界值，该属性和onEndReached配合使用，因为onEndReached滑动结束的标志是以该值作为判断条件的

## 参考

- [[How to implement pull up to load more in React Native using ListView for Android?](https://stackoverflow.com/questions/40087775/how-to-implement-pull-up-to-load-more-in-react-native-using-listview-for-android)](https://stackoverflow.com/questions/40087775/how-to-implement-pull-up-to-load-more-in-react-native-using-listview-for-android)
- [React Native: Hướng dẫn tạo Load More trong ListView](https://www.youtube.com/watch?v=vFI9iyQP4XU)
- [react-native试玩(8)-列表视图](http://blog.csdn.net/itfootball/article/details/48245137)

源码：[https://github.com/tomoya92/ITNews-React-Native](https://github.com/tomoya92/ITNews-React-Native)