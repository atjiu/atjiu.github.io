---
layout: post
title: Android-Studio自带小图标Vector用法
date: 2017-04-05 10:04:20
categories: Android学习笔记
tags: Android
author: 朋也
---

* content
{:toc}

- [Android组件SwiperRefreshLayout的上拉加载更多实现](https://blog.yiiu.co/2017/03/31/android-swiperrefreshlayout-loadmore/)
- [Android双击TitleBar回顶部功能实现](https://blog.yiiu.co/2017/03/31/android-doubleclick-backtotop/)
- [Android万能ListView的BaseAdapter实现](https://blog.yiiu.co/2017/03/31/android-listview-adapter/)
- [Android-Studio自带小图标Vector用法](https://blog.yiiu.co/2017/04/05/android-vector/)
- [Android布局实现-ViewPager+Fragment+TabLayout整合](https://blog.yiiu.co/2017/04/05/android-viewpager-fragment-tablayout/)
- [Android布局实现-BottomNavigationView+ViewPager+Fragment+整合](https://blog.yiiu.co/2017/04/05/android-bottomnavigationview-viewpager-fragment/)
- [Android万能RecyclerView的Adapter实现（通用类实现，包括分割线，点击事件，点击波纹，上拉加载更多）](https://blog.yiiu.co/2017/04/10/android-recyclerview-adapter/)

开发Android APP，会用到很多的小图标，一般都是做不同分辨率的图片，相当麻烦，而且图片还会失贞，下面说一下as自带的vector小图标，相当好用

## 对drawable文件夹右键选择Vector Asset

![](/assets/1D14C332-10D9-41BD-A9EB-61BA2E894A7C.png)




## 点击Icon，进入选择图标

![](/assets/QQ20170405-141720@2x.png)

## 进行搜索

![](/assets/QQ20170405-141808@2x.png)

## 确定

回到drawable文件夹可以看到一个xml文件的图标就生成了

默认生成的图标是黑色的，大小是24dp x 24dp的，如果想改变，可以打开文件，进行修改

![](/assets/QQ20170405-142151@2x.png)

**用xml文件定义的小图标好处就不用说了，as里内置了很多的这样的小图标，大赞！**
