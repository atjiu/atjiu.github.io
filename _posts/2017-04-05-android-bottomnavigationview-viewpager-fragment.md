---
layout: post
title: Android布局实现-BottomNavigationView+ViewPager+Fragment+整合
date: 2017-04-05 16:13:20
categories: Android学习笔记
tags: Android ViewPager Fragment BottomNavigationView
author: 朋也
---

* content
{:toc}

先上图

![](https://tomoya92.github.io/assets/bottomnavigationview-viewpager.gif)




## 创建项目

使用Android-Studio创建一个BottomNavigationView项目

![](https://tomoya92.github.io/assets/QQ20170405-160204@2x.png)

## 创建布局

修改activity_main.xml文件

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
  xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:app="http://schemas.android.com/apk/res-auto"
  android:id="@+id/container"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:orientation="vertical">

  <android.support.v4.view.ViewPager
    android:id="@+id/viewPager"
    android:layout_width="match_parent"
    android:layout_height="0dp"
    android:layout_weight="1"/>

  <android.support.design.widget.BottomNavigationView
    android:id="@+id/navigation"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_gravity="bottom"
    android:background="?android:attr/windowBackground"
    app:menu="@menu/navigation"/>

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

## 修改menu/navigation.xml文件

在item项里添加上`android:orderInCategory`用于标记item的位置

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">

  <item
    android:id="@+id/navigation_home"
    android:orderInCategory="0"
    android:icon="@drawable/ic_home_black_24dp"
    android:title="@string/title_home"/>

  <item
    android:id="@+id/navigation_dashboard"
    android:orderInCategory="1"
    android:icon="@drawable/ic_dashboard_black_24dp"
    android:title="@string/title_dashboard"/>

  <item
    android:id="@+id/navigation_notifications"
    android:orderInCategory="2"
    android:icon="@drawable/ic_notifications_black_24dp"
    android:title="@string/title_notifications"/>

</menu>

```

## 编辑MainActivity类

```java
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomNavigationView;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.view.MenuItem;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity implements ViewPager.OnPageChangeListener {

  private BottomNavigationView navigation;
  private ViewPager viewPager;

  private Fragment1 fragment1 = new Fragment1();
  private Fragment2 fragment2 = new Fragment2();
  private Fragment3 fragment3 = new Fragment3();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    viewPager = (ViewPager) findViewById(R.id.viewPager);
    //添加viewPager事件监听（很容易忘）
    viewPager.addOnPageChangeListener(this);
    navigation = (BottomNavigationView) findViewById(R.id.navigation);
    navigation.setOnNavigationItemSelectedListener(mOnNavigationItemSelectedListener);

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

  private BottomNavigationView.OnNavigationItemSelectedListener mOnNavigationItemSelectedListener
      = new BottomNavigationView.OnNavigationItemSelectedListener() {

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
      //点击BottomNavigationView的Item项，切换ViewPager页面
      //menu/navigation.xml里加的android:orderInCategory属性就是下面item.getOrder()取的值
      viewPager.setCurrentItem(item.getOrder());
      return true;
    }

  };

  @Override
  public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

  }

  @Override
  public void onPageSelected(int position) {
    //页面滑动的时候，改变BottomNavigationView的Item高亮
    navigation.getMenu().getItem(position).setChecked(true);
  }

  @Override
  public void onPageScrollStateChanged(int state) {

  }
}
```

就是这么简单，快拿去添加自己的逻辑吧！

**Android现在开发真简单呀！**
