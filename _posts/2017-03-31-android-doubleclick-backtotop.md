---
layout: post
title: Android双击TitleBar回顶部功能实现
date: 2017-03-31 9:43:20
categories: Android学习笔记
tags: Android BackToTop
author: 朋也
---

* content
{:toc}

偶然发现的这个功能，就给移过来了，整理了一下，也是一个类就实现的，使用很方便

**特别感谢[@TakWolf](https://github.com/TakWolf)大大的开源项目，学了好多Android方面的东西**




## 双击返回顶部代码

```java
public class DoubleClickBackToContentTopListener implements View.OnClickListener {

  private final long delayTime = 300;
  private long lastClickTime = 0;
  private final IBackToContentTopView backToContentTopView;

  public interface IBackToContentTopView {
    void backToContentTop();
  }

  @Override
  public final void onClick(View v) {
    long nowClickTime = System.currentTimeMillis();
    if (nowClickTime - lastClickTime > delayTime) {
      lastClickTime = nowClickTime;
    } else {
      onDoubleClick(v);
    }
  }

  public DoubleClickBackToContentTopListener(@NonNull IBackToContentTopView backToContentTopView) {
    this.backToContentTopView = backToContentTopView;
  }

  public void onDoubleClick(View v) {
    backToContentTopView.backToContentTop();
  }

}
```

## 使用方法

```java
public class CNodeActivity extends Activity implements 
    DoubleClickBackToContentTopListener.IBackToContentTopView {

  private Toolbar toolbar;
  private ListView listView;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_cnode);

    toolbar = (Toolbar) findViewById(R.id.toolbar);
    toolbar.setTitle(R.string.cnode);
    toolbar.setNavigationOnClickListener(v -> this.finish());
    toolbar.setOnClickListener(new DoubleClickBackToContentTopListener(this));

    listView = (ListView) findViewById(R.id.list_view);
    
    listView.setAdapter(//TODO);

    initData();

  }

  private void initData() {
    //TODO
  }

  @Override
  public void backToContentTop() {
    listView.setSelection(0);
  }

}
```

说明一下，DoubleClickBackToContentTopListener类里的delayTime属性是双击之间的时间差，这里默认设置的是300毫秒

就是这么简单，一个好的封装，可以省多少事呀！

## 参考

[https://github.com/TakWolf/CNode-Material-Design](https://github.com/TakWolf/CNode-Material-Design)
