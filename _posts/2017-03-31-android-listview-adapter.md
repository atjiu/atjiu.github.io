---
layout: post
title: Android万能ListView的BaseAdapter实现
date: 2017-03-31 10:11:20
categories: Android学习笔记
tags: Android ListView BaseAdapter
author: 朋也
---

* content
{:toc}

学Android的时候，找视频在慕课网上找到的这个万能适配器

任何ListView都可以用的，而且只需要写一个匿名内部类就可以实现一个ListView的数据渲染，还是很好用的




## 万能适配器代码

```java
public abstract class MyBaseAdapter<T> extends BaseAdapter {

  protected List<T> _data;
  protected Context context;

  public MyBaseAdapter(Context context, List<T> data) {
    this._data = data;
    this.context = context;
  }

  @Override
  public int getCount() {
    return _data.size();
  }

  @Override
  public Object getItem(int position) {
    return _data.get(position);
  }

  @Override
  public long getItemId(int position) {
    return position;
  }

  @Override
  public abstract View getView(int position, View convertView, ViewGroup parent);

  protected static class ViewHolder {

    private SparseArray<View> views;
    private int position;
    private View convertView;
    private Context context;

    public ViewHolder(Context context, ViewGroup parent, int layoutId, int position) {
      this.context = context;
      this.position = position;
      this.views = new SparseArray<>();
      convertView = LayoutInflater.from(context).inflate(layoutId, parent, false);
      convertView.setTag(this);
    }

    public static ViewHolder get(Context context, View convertView, ViewGroup parent, int layoutId, int position) {
      if(convertView == null) {
        return new ViewHolder(context, parent, layoutId, position);
      } else {
        ViewHolder holder = (ViewHolder) convertView.getTag();
        holder.position = position;
        return holder;
      }
    }

    public <T extends View> T getView(int viewId) {
      View view = views.get(viewId);
      if(view == null) {
        view = convertView.findViewById(viewId);
        views.put(viewId, view);
      }
      return (T) view;
    }

    public View getConvertView() {
      return convertView;
    }

    public ViewHolder setText(int viewId, String text) {
      TextView textView = getView(viewId);
      textView.setText(text);
      return this;
    }

    public ViewHolder setNetImage(int viewId, String url) {
      ImageView imageView = getView(viewId);
      Glide
          .with(context)
          .load(url)
          .centerCrop()
//        .placeholder(R.drawable.loading_spinner)
          .crossFade()
          .into(imageView);
      return this;
    }
  }

}
```

## 使用方法

```java
adapter = new MyBaseAdapter<Data>(this, data) {
  @Override
  public View getView(int position, View convertView, ViewGroup parent) {
    ViewHolder holder = ViewHolder.get(context, convertView, parent, R.layout.list_view_item_cnode, position);
    Data topic = _data.get(position);
    holder.setText(R.id.title, topic.getTitle())
        .setText(R.id.time, FormatUtil.getRelativeTimeSpanString(topic.getCreate_at()))
        .setText(R.id.replyCount, String.valueOf(topic.getReply_count()));
    holder.setNetImage(R.id.avatar, topic.getAuthor().getAvatar_url());
    return holder.getConvertView();
  }
};
listView.setAdapter(adapter);
```

就是这么简单，一个好的封装，可以省多少事呀！

## 参考

[http://www.imooc.com/learn/372](http://www.imooc.com/learn/372)
