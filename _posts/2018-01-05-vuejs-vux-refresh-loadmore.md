---
layout: post
title: vue.js整合vux里的上拉加载下拉刷新
categories: vue.js学习笔记
tags: vue.js vux 上拉加载 下拉刷新
author: 朋也
---

* content
{:toc}

## 先上图

![](https://tomoya92.github.io/assets/vuejs-vux-refresh-loadmore.gif)




## 创建项目

使用vue-cli 创建一个vue项目

安装vux，可以参考：[vux快速入门](https://vux.li/#/zh-CN/?id=%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8)

## 配置

[官方文档地址](https://vux.li/#/zh-CN/components?id=scroller)

打开后会看到一段话 

> 该组件已经不再维护，也不建议使用，大部分情况下也不需要用到该组件。 
> 建议使用第三方相关组件，相关 issue 将不会处理。

不知道作者为啥不维护了，明明需求挺多的

我没有用demo里的 `LoadMore` 组件，用的是 `Scroller`里自带的 `use-pullup, use-pulldown` 下面是我的配置

```html
<!-- 
 height: 我用到x-header了，文档里说header高是48px,所以这里设置成-48
 -->
<scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore"
              use-pulldown :pulldown-config="pulldownDefaultConfig" @on-pulldown-loading="refresh"
              lock-x ref="scrollerBottom" height="-48">
</scroller>

<script>
	import {Scroller, XHeader} from 'vux'

  const pulldownDefaultConfig = {
    content: '下拉刷新',
    height: 40,
    autoRefresh: false,
    downContent: '下拉刷新',
    upContent: '释放后刷新',
    loadingContent: '正在刷新...',
    clsPrefix: 'xs-plugin-pulldown-'
  }

  const pullupDefaultConfig = {
    content: '上拉加载更多',
    pullUpHeight: 60,
    height: 40,
    autoRefresh: false,
    downContent: '释放后加载',
    upContent: '上拉加载更多',
    loadingContent: '加载中...',
    clsPrefix: 'xs-plugin-pullup-'
  }

  export default {
    components: {
      XHeader,
      Scroller
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.scrollerBottom.reset({top: 0})
      })
    },
    data() {
      return {
        list: [],
        pullupDefaultConfig: pullupDefaultConfig,
        pulldownDefaultConfig: pulldownDefaultConfig
      }
    },
    methods: {
      refresh() {
        
      },
      loadMore() {
        
      }
    }
  }
</script>
```

## 请求接口遍历数据

接口服务用的是mock.js生成的数据，可以看一下这篇博客 [使用mock.js随机数据和使用express输出json接口](https://tomoya92.github.io/2018/01/05/express-mockjs-json/)

安装 axios 

```
yarn add axios
```

```js
//...
  methods: {
    fetchData(cb) {
      axios.get('http://localhost:3000/').then(response => {
        this.$nextTick(() => {
          this.$refs.scrollerBottom.reset()
        })
        cb(response.data)
      })
    }
  }
//...
```

完善refresh,loadMore方法

```js
//...
  methods: {
    refresh() {
      this.fetchData(data => {
        this.list = data.list
        this.$refs.scrollerBottom.enablePullup()
        this.$refs.scrollerBottom.donePulldown()
      })
    },
    loadMore() {
      this.fetchData(data => {
        if (this.list.length >= 10) {
          this.$refs.scrollerBottom.disablePullup()
        }
        this.list = this.list.concat(data.list)
        this.$refs.scrollerBottom.donePullup()
      })
    }
  }
//...
```

在组件加载的时候调用一下 loadMore 方法

```js
//...
  mounted() {
    this.$nextTick(() => {
      this.$refs.scrollerBottom.reset({top: 0})
    })
    this.loadMore()
  }
//...
```

最后把html部分补全

```html
<scroller>
  <div style="padding: 10px 0">
    <div class="box" v-for="(item, index) in list" :key="index">
      <p class="list">{{item.name}}</p>
    </div>
  </div>
</scroller>
```

## 完整代码

```html
<template>
	<div>
    <x-header :left-options="{'showBack': false}">上拉加载，下拉刷新</x-header>
    <scroller use-pullup :pullup-config="pullupDefaultConfig" @on-pullup-loading="loadMore"
              use-pulldown :pulldown-config="pulldownDefaultConfig" @on-pulldown-loading="refresh"
              lock-x ref="scrollerBottom" height="-48">
      <div style="padding: 10px 0">
        <div class="box" v-for="(item, index) in list" :key="index">
          <p class="list">{{item.name}}</p>
        </div>
      </div>
    </scroller>
  </div>
</template>

<script>
  import {Scroller, XHeader} from 'vux'
  import axios from 'axios'

  const pulldownDefaultConfig = {
    content: '下拉刷新',
    height: 40,
    autoRefresh: false,
    downContent: '下拉刷新',
    upContent: '释放后刷新',
    loadingContent: '正在刷新...',
    clsPrefix: 'xs-plugin-pulldown-'
  }

  const pullupDefaultConfig = {
    content: '上拉加载更多',
    pullUpHeight: 60,
    height: 40,
    autoRefresh: false,
    downContent: '释放后加载',
    upContent: '上拉加载更多',
    loadingContent: '加载中...',
    clsPrefix: 'xs-plugin-pullup-'
  }

  export default {
    components: {
      XHeader,
      Scroller
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.scrollerBottom.reset({top: 0})
      })
      this.loadMore()
    },
    data() {
      return {
        list: [],
        pullupDefaultConfig: pullupDefaultConfig,
        pulldownDefaultConfig: pulldownDefaultConfig
      }
    },
    methods: {
      fetchData(cb) {
        axios.get('http://localhost:3000/').then(response => {
          this.$nextTick(() => {
            this.$refs.scrollerBottom.reset()
          })
          cb(response.data)
        })
      },
      refresh() {
        this.fetchData(data => {
          this.list = data.list
          this.$refs.scrollerBottom.enablePullup()
          this.$refs.scrollerBottom.donePulldown()
        })
      },
      loadMore() {
        this.fetchData(data => {
          if (this.list.length >= 10) {
            this.$refs.scrollerBottom.disablePullup()
          }
          this.list = this.list.concat(data.list)
          this.$refs.scrollerBottom.donePullup()
        })
      }
    }
  }
</script>

<style lang="less">
  .box {
    padding: 5px 10px 5px 10px;
    &:first-child {
      padding: 0 10px 5px 10px;
    }
    &:last-child {
      padding: 5px 10px 0 10px;
    }
  }
  .list {
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #f0f0f0;
    padding: 30px;
  }
  .xs-plugin-pulldown-container {
    line-height: 40px;
  }
  .xs-plugin-pullup-container {
    line-height: 40px;
  }
</style>
```