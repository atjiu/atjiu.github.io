---
layout: post
title: Android布局实现-ViewPager+Fragment+TabLayout整合
date: 2017-04-05 14:36:20
categories: Android学习笔记
tags: Android ViewPager Fragment TabLayout
author: 朋也
---

* content
{:toc}

先上图

![](https://tomoya92.github.io/assets/viewpager-fragment-tablayout.gif)




## 创建项目

使用Android-Studio创建一个空Activity项目

![](https://tomoya92.github.io/assets/QQ20170405-154548.png)

## 引入依赖

打开app下的build.gradle，添加上依赖，这个依赖是支持TabLayout的包

```
compile 'com.android.support:design:25.3.1'
```

## 创建布局

修改activity_main.xml文件

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:orientation="vertical">

  <android.support.design.widget.TabLayout
    android:id="@+id/tabLayout"
    android:layout_width="match_parent"
    android:layout_height="40dp">

    <android.support.design.widget.TabItem
      android:text="item1"
      android:padding="10dp"
      android:layout_width="wrap_content"
      android:layout_height="wrap_content"/>

    <android.support.design.widget.TabItem
      android:text="item2"
      android:padding="10dp"
      android:layout_width="wrap_content"
      android:layout_height="wrap_content"/>

    <android.support.design.widget.TabItem
      android:text="item3"
      android:padding="10dp"
      android:layout_width="wrap_content"
      android:layout_height="wrap_content"/>

  </android.support.design.widget.TabLayout>

  <android.support.v4.view.ViewPager
    android:id="@+id/viewPager"
    android:layout_width="match_parent"
    android:layout_height="match_parent"/>

</LinearLayout>

```

## 创建三个Fragment(布局及类)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
              android:orientation="vertical"
              android:layout_width="match_parent"
              android:layout_height="match_parent">

  <TextView
    android:id="@+id/textView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="fragment1"/>
</LinearLayout>
```

```java
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by tomoya on 4/5/17.
 */

public class Fragment1 extends Fragment {

  @Nullable
  @Override
  public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
    return inflater.inflate(R.layout.fragment1, container, false);
  }
}
```

## 编辑MainActivity类

```java
import android.support.design.widget.TabLayout;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

public class MainActivity extends AppCompatActivity implements ViewPager.OnPageChangeListener,
    TabLayout.OnTabSelectedListener{

  private ViewPager viewPager;
  private TabLayout tabLayout;

  private Fragment1 fragment1 = new Fragment1();
  private Fragment2 fragment2 = new Fragment2();
  private Fragment3 fragment3 = new Fragment3();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    viewPager = (ViewPager) findViewById(R.id.viewPager);
    tabLayout = (TabLayout) findViewById(R.id.tabLayout);

    //注册监听
    viewPager.addOnPageChangeListener(this);
    tabLayout.addOnTabSelectedListener(this);

    //添加适配器，在viewPager里引入Fragment
    viewPager.setAdapter(new FragmentPagerAdapter(getSupportFragmentManager()) {
      @Override
      public Fragment getItem(int position) {
        switch (position) {
          case 0:
            return fragment1;
          case 1:
            return fragment2;
          case 2:
            return fragment3;
        }
        return null;
      }

      @Override
      public int getCount() {
        return 3;
      }
    });

  }

  @Override
  public void onTabSelected(TabLayout.Tab tab) {
    //TabLayout里的TabItem被选中的时候触发
    viewPager.setCurrentItem(tab.getPosition());
  }

  @Override
  public void onTabUnselected(TabLayout.Tab tab) {

  }

  @Override
  public void onTabReselected(TabLayout.Tab tab) {

  }

  @Override
  public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

  }

  @Override
  public void onPageSelected(int position) {
    //viewPager滑动之后显示触发
    tabLayout.getTabAt(position).select();
  }

  @Override
  public void onPageScrollStateChanged(int state) {

  }
}
```

就是这么简单，快拿去添加自己的逻辑吧！

**Android现在开发真简单呀！**
