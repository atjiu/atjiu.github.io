---
layout: post
title: Android万能RecyclerView的Adapter实现（通用类实现，包括分割线，点击事件，点击波纹，上拉加载更多）
date: 2017-04-10 17:45:20
categories: Android学习笔记
tags: Android RecyclerView Adapter
author: 朋也
---

* content
{:toc}

学Android的时候，找视频在慕课网上看到了个优雅使用RecyclerView实现复杂布局的视频，然后封装了一个通用的Adapter

任何RecyclerView都可以用的，而且只需要写一个匿名内部类就可以实现数据渲染，还是很好用的

先上图

![](https://tomoya92.github.io/assets/recyclerview-clickevent-loadmore.gif)




## 万能适配器代码

```java
import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.SparseArray;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.List;

public abstract class MyRecyclerViewAdapter<T> extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

  protected List<T> list;
  private Context context;
  protected LayoutInflater inflater;
  private OnItemClickListener onItemClickListener;

  public void setOnItemClickListener(OnItemClickListener onItemClickListener) {
    this.onItemClickListener = onItemClickListener;
  }

  public MyRecyclerViewAdapter(Context context, List<T> list) {
    this.context = context;
    this.list = list;
    inflater = LayoutInflater.from(context);
  }

  @Override
  public abstract RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType);

  @Override
  @SuppressWarnings("unchecked")
  public void onBindViewHolder(final RecyclerView.ViewHolder holder, int position) {
    ((TypeViewHolder) holder).bindHolder(list.get(position));
    //添加点击事件
    if(onItemClickListener != null) {
      holder.itemView.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          int position = holder.getLayoutPosition();
          onItemClickListener.onItemClick(holder.itemView, position);
        }
      });
      holder.itemView.setOnLongClickListener(new View.OnLongClickListener() {
        @Override
        public boolean onLongClick(View v) {
          int position = holder.getLayoutPosition();
          onItemClickListener.onItemLongClick(holder.itemView, position);
          return false;
        }
      });
    }
  }

  @Override
  public abstract int getItemViewType(int position);

  @Override
  public int getItemCount() {
    return list.size();
  }


  /**
   * -----------------------------------------------------------------------------------------------
   */
  public abstract class TypeViewHolder extends RecyclerView.ViewHolder {

    private View convertView;
    private SparseArray<View> views = new SparseArray<>();

    public TypeViewHolder(View itemView) {
      super(itemView);
      this.convertView = itemView;
    }

    @SuppressWarnings("unchecked")
    public <V extends View> V getView(int viewId) {
      View view = views.get(viewId);
      if(view == null) {
        view = convertView.findViewById(viewId);
        views.put(viewId, view);
      }
      return (V) view;
    }

    public TypeViewHolder setText(int viewId, String text) {
      TextView textView = getView(viewId);
      textView.setText(text);
      return this;
    }

    public TypeViewHolder setBackgroundColor(int viewId, int colorId) {
      ImageView imageView = getView(viewId);
      imageView.setBackgroundResource(colorId);
      return this;
    }

    public abstract void bindHolder(T model);
  }

  /**
   * -----------------------------------------------------------------------------------------------
   */
  public interface OnItemClickListener {
    void onItemClick(View view, int position);
    void onItemLongClick(View view, int position);
  }

  /**
   * -----------------------------------------------------------------------------------------------
   */
  public static class DividerItemDecoration extends RecyclerView.ItemDecoration {

    private final int[] ATTRS = new int[]{
        android.R.attr.listDivider
    };

    public static final int HORIZONTAL_LIST = LinearLayoutManager.HORIZONTAL;

    public static final int VERTICAL_LIST = LinearLayoutManager.VERTICAL;

    private Drawable mDivider;

    private int mOrientation;

    public DividerItemDecoration(Context context, int orientation) {
      final TypedArray a = context.obtainStyledAttributes(ATTRS);
      mDivider = a.getDrawable(0);
      a.recycle();
      setOrientation(orientation);
    }

    public void setOrientation(int orientation) {
      if (orientation != HORIZONTAL_LIST && orientation != VERTICAL_LIST) {
        throw new IllegalArgumentException("invalid orientation");
      }
      mOrientation = orientation;
    }

    @Override
    public void onDraw(Canvas c, RecyclerView parent, RecyclerView.State state) {
      if (mOrientation == VERTICAL_LIST) {
        drawVertical(c, parent);
      } else {
        drawHorizontal(c, parent);
      }
    }

    public void drawVertical(Canvas c, RecyclerView parent) {
      final int left = parent.getPaddingLeft();
      final int right = parent.getWidth() - parent.getPaddingRight();

      final int childCount = parent.getChildCount();
      for (int i = 0; i < childCount; i++) {
        final View child = parent.getChildAt(i);
        android.support.v7.widget.RecyclerView v = new android.support.v7.widget.RecyclerView(parent.getContext());
        final RecyclerView.LayoutParams params = (RecyclerView.LayoutParams) child
            .getLayoutParams();
        final int top = child.getBottom() + params.bottomMargin;
        final int bottom = top + mDivider.getIntrinsicHeight();
        mDivider.setBounds(left, top, right, bottom);
        mDivider.draw(c);
      }
    }

    public void drawHorizontal(Canvas c, RecyclerView parent) {
      final int top = parent.getPaddingTop();
      final int bottom = parent.getHeight() - parent.getPaddingBottom();

      final int childCount = parent.getChildCount();
      for (int i = 0; i < childCount; i++) {
        final View child = parent.getChildAt(i);
        final RecyclerView.LayoutParams params = (RecyclerView.LayoutParams) child
            .getLayoutParams();
        final int left = child.getRight() + params.rightMargin;
        final int right = left + mDivider.getIntrinsicHeight();
        mDivider.setBounds(left, top, right, bottom);
        mDivider.draw(c);
      }
    }

    @Override
    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
      if (mOrientation == VERTICAL_LIST) {
        outRect.set(0, 0, 0, mDivider.getIntrinsicHeight());
      } else {
        outRect.set(0, 0, mDivider.getIntrinsicWidth(), 0);
      }
    }
  }
}
```

## 使用方法

```java
recyclerView = (RecyclerView) findViewById(R.id.recyclerView);
recyclerView.setLayoutManager(new LinearLayoutManager(this));
adapter = new MyRecyclerViewAdapter<DataModel>(this, list) {
  @Override
  public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    switch (viewType) {
      case DataModel.TYPE_ONE:
        return new TypeViewHolder(inflater.inflate(R.layout.item_type_one, parent, false)) {
          @Override
          public void bindHolder(DataModel model) {
            this.setText(R.id.name, model.name);
            this.setBackgroundColor(R.id.avatar, model.avatarColor);
          }
        };
      case DataModel.TYPE_TWO:
        return new TypeViewHolder(inflater.inflate(R.layout.item_type_two, parent, false)) {
          @Override
          public void bindHolder(DataModel model) {
            this.setText(R.id.name, model.name).setText(R.id.content, model.content);
            this.setBackgroundColor(R.id.avatar, model.avatarColor);
          }
        };
      case DataModel.TYPE_THREE:
        return new TypeViewHolder(inflater.inflate(R.layout.item_type_three, parent, false)) {
          @Override
          public void bindHolder(DataModel model) {
            this.setText(R.id.name, model.name).setText(R.id.content, model.content);
            this.setBackgroundColor(R.id.avatar, model.avatarColor).setBackgroundColor(R.id.contentImage, model.contentColor);
          }
        };
    }
    return null;
  }

  @Override
  public int getItemViewType(int position) {
    return list.get(position).type;
  }
};
recyclerView.setAdapter(adapter);
```

## 列表分割线

```java
recyclerView.addItemDecoration(new MyRecyclerViewAdapter.DividerItemDecoration(this, MyRecyclerViewAdapter.DividerItemDecoration.VERTICAL_LIST));

//注意 DividerItemDecoration 这个类要用 MyRecyclerViewAdapter下的，不要用Android SDK里的
```

## 列表点击事件用法

```java
adapter.setOnItemClickListener(new MyRecyclerViewAdapter.OnItemClickListener() {
  @Override
  public void onItemClick(View view, int position) {
    //TODO
  }

  @Override
  public void onItemLongClick(View view, int position) {
    //TODO
  }
});
```

## 列表点击波纹效果

创建波纹效果文件

```xml
<?xml version="1.0" encoding="utf-8"?>
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
        android:color="#D7D7D7">
  <item android:drawable="@android:color/white"/>
</ripple>
```

在RecyclerView的item布局里引入即可
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  android:background="@drawable/touch_bg"
  android:orientation="horizontal"
  android:padding="10dp">
  ...
</LinearLayout>
```

## 上拉加载更多

利用viewType来动态的增加删除FooterView

创建一个加载更多的View

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
              xmlns:tools="http://schemas.android.com/tools"
              android:layout_width="match_parent"
              android:layout_height="wrap_content"
              android:gravity="center"
              android:orientation="vertical">

  <ProgressBar
    android:id="@+id/icon_loading"
    android:layout_width="wrap_content"
    android:layout_height="64dp" />

</LinearLayout>
```

原理：引用：[http://blog.csdn.net/never_cxb/article/details/50759109](http://blog.csdn.net/never_cxb/article/details/50759109)

> 注意 onPreExecute() 给 mArticleList 增加了一个null标记Footer，如果是第一次进入页面（mArticleList为空）不需要加Footer。<br/>
> 当数据加载完毕后，用 mArticleList.remove(mArticleList.size() - 1);把最下面的Footer删除。<br/>
> 再用 mArticleList.addAll(moreArticles); 增加新增的新闻数据，<br/>
> 并用 mAdapter.notifyDataSetChanged(); 通知 RecyclerView.Adapter 有数据改变。

代码实现

```java
private loading = true;

@Override
protected void onCreate(Bundle savedInstanceState) {
  //...
  recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
    @Override
    public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
      super.onScrolled(recyclerView, dx, dy);
      LinearLayoutManager layoutManager = (LinearLayoutManager) recyclerView.getLayoutManager();
      int totalItemCount = layoutManager.getItemCount();
      int lastVisibleItem = layoutManager.findLastVisibleItemPosition();
      if (!loading && totalItemCount < lastVisibleItem + 3) {
        page++;
        initData();
        loading = true;
      }
    }
  });
  //...
}

private void initData() {
  //TODO
  if(page > 1) {
    data.remove(data.size()-1);
  }
  data.addAll("网络请求返回的数据");
  data.add(data.size(), null);
  loading = false;
}
```

另外还要对Adapter里实现的方法做一下处理

```java
adapter = new MyRecyclerViewAdapter<DataModel>(this, list) {
  @Override
  public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    switch (viewType) {
      case -1://viewType为-1的时候，就显示FooterView（这里的-1，可以在getItemViewType()方法里进行修改）
        return new TypeViewHolder(inflater.inflate(R.layout.footer_load_more, parent, false)) {
          @Override
          public void bindHolder(Data model) {}
        };
      case DataModel.TYPE_ONE:
        return new TypeViewHolder(inflater.inflate(R.layout.item_type_one, parent, false)) {
          @Override
          public void bindHolder(DataModel model) {
            this.setText(R.id.name, model.name);
            this.setBackgroundColor(R.id.avatar, model.avatarColor);
          }
        };
      case DataModel.TYPE_TWO:
        return new TypeViewHolder(inflater.inflate(R.layout.item_type_two, parent, false)) {
          @Override
          public void bindHolder(DataModel model) {
            this.setText(R.id.name, model.name).setText(R.id.content, model.content);
            this.setBackgroundColor(R.id.avatar, model.avatarColor);
          }
        };
      case DataModel.TYPE_THREE:
        return new TypeViewHolder(inflater.inflate(R.layout.item_type_three, parent, false)) {
          @Override
          public void bindHolder(DataModel model) {
            this.setText(R.id.name, model.name).setText(R.id.content, model.content);
            this.setBackgroundColor(R.id.avatar, model.avatarColor).setBackgroundColor(R.id.contentImage, model.contentColor);
          }
        };
    }
    return null;
  }

  @Override
  public int getItemViewType(int position) {
    if(super.list.get(position) == null) return -1;
    return list.get(position).type;
  }
};
```

**关于加载更多那块的代码还可以进行封装一下，有兴趣的朋友可以试试**

就是这么简单，一个好的封装，可以省多少事呀！

## 参考

- [http://www.imooc.com/learn/731](http://www.imooc.com/learn/731)
- [http://blog.csdn.net/lmj623565791/article/details/45059587](http://blog.csdn.net/lmj623565791/article/details/45059587)
- [http://blog.csdn.net/never_cxb/article/details/50759109](http://blog.csdn.net/never_cxb/article/details/50759109)
- [http://www.jianshu.com/p/65d2355feb4b](http://www.jianshu.com/p/65d2355feb4b)
