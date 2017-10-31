---
layout: post
title: Android组件SwiperRefreshLayout的上拉加载更多实现
date: 2017-03-31 9:10:20
categories: Android学习笔记
tags: Android SwiperRefreshLayout LoadMore
author: 朋也
---

* content
{:toc}

android自带的SwiperRefreshLayout布局已经实现了下拉刷新，但为啥不给上拉加载也实现了呢。。

想起了以前用过的APP，发现CNodeMD的原生客户端里有，于是就扣了下代码，下面来分享一下

**特别感谢[@TakWolf](https://github.com/TakWolf)大大的开源项目，学了好多Android方面的东西**




## 上拉加载类代码

```java
public class LoadMoreFooter implements View.OnClickListener {

  public static final int STATE_DISABLE = 0;
  public static final int STATE_LOADING = 1;
  public static final int STATE_FINISHED = 2;
  public static final int STATE_ENDLESS = 3;
  public static final int STATE_FAILED = 4;

  @IntDef({STATE_DISABLE, STATE_LOADING, STATE_FINISHED, STATE_ENDLESS, STATE_FAILED})
  @Retention(RetentionPolicy.SOURCE)
  public @interface State {
  }

  public interface OnLoadMoreListener {

    void onLoadMore();

  }

  protected ProgressBar iconLoading;

  protected TextView tvText;

  @State
  private int state = STATE_DISABLE;

  private final OnLoadMoreListener loadMoreListener;

  public LoadMoreFooter(@NonNull Context context, @NonNull ListView listView, @NonNull OnLoadMoreListener loadMoreListener) {
    this.loadMoreListener = loadMoreListener;
    View footerView = LayoutInflater.from(context).inflate(R.layout.footer_load_more, listView, false);

    iconLoading = (ProgressBar) footerView.findViewById(R.id.icon_loading);
    tvText = (TextView) footerView.findViewById(R.id.tv_text);

    listView.addFooterView(footerView, null, false);
    listView.setOnScrollListener(new AbsListView.OnScrollListener() {

      @Override
      public void onScrollStateChanged(AbsListView view, int scrollState) {
        if (view.getLastVisiblePosition() == view.getCount() - 1) {
          checkLoadMore();
        }
      }

      @Override
      public void onScroll(AbsListView view, int firstVisibleItem, int visibleItemCount, int totalItemCount) {
      }

    });
  }

  private void checkLoadMore() {
    if (getState() == STATE_ENDLESS || getState() == STATE_FAILED) {
      setState(STATE_LOADING);
      loadMoreListener.onLoadMore();
    }
  }

  @State
  public int getState() {
    return state;
  }

  public void setState(@State int state) {
    if (this.state != state) {
      this.state = state;
      switch (state) {
        case STATE_DISABLE:
          iconLoading.setVisibility(View.GONE);
          tvText.setVisibility(View.GONE);
          tvText.setClickable(false);
          break;
        case STATE_LOADING:
          iconLoading.setVisibility(View.VISIBLE);
          tvText.setVisibility(View.GONE);
          tvText.setClickable(false);
          break;
        case STATE_FINISHED:
          iconLoading.setVisibility(View.GONE);
          tvText.setVisibility(View.VISIBLE);
          tvText.setText(R.string.load_more_nomore);
          tvText.setClickable(false);
          break;
        case STATE_ENDLESS:
          iconLoading.setVisibility(View.GONE);
          tvText.setVisibility(View.VISIBLE);
          tvText.setText(R.string.load_more_endless);
          tvText.setClickable(true);
          break;
        case STATE_FAILED:
          iconLoading.setVisibility(View.GONE);
          tvText.setVisibility(View.VISIBLE);
          tvText.setText(R.string.load_more_fail);
          tvText.setClickable(true);
          break;
        default:
          throw new AssertionError("Unknow state.");
      }
    }
  }

  @Override
  public void onClick(View v) {
    checkLoadMore();
  }

}
```

## 使用方法

```java
public class CNodeActivity extends Activity implements
    SwipeRefreshLayout.OnRefreshListener, LoadMoreFooter.OnLoadMoreListener {

  private ListView listView;
  private SwipeRefreshLayout refreshLayout;
  private List<Data> data = new ArrayList<>();
  private LoadMoreFooter loadMoreFooter;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_cnode);

    listView = (ListView) findViewById(R.id.list_view);
    refreshLayout = (SwipeRefreshLayout) findViewById(R.id.refresh_layout);
    listView.setAdapter(new ArrayAdapter()...);
    loadMoreFooter = new LoadMoreFooter(this, listView, this);

    refreshLayout.setOnRefreshListener(this);

    refreshLayout.setRefreshing(true);
    initData();

  }

  private void initData() {
    //TODO
  }

  @Override
  public void onRefresh() {
    page = 1;
    data.clear();
    initData();
  }

  @Override
  public void onLoadMore() {
    page++;
    loadMoreFooter.setState(LoadMoreFooter.STATE_LOADING);
    initData();
  }

}
```

说明一下，LoadMoreFooter里有五个状态值，在请求数据的时候，将状态设置成`LoadMoreFooter.STATE_LOADING`，数据请求完了，设置成`LoadMoreFooter.STATE_ENDLESS`，还有其它的状态，对就不同时候的状态

就是这么简单，一个好的封装，可以省多少事呀！

## 参考

[https://github.com/TakWolf/CNode-Material-Design](https://github.com/TakWolf/CNode-Material-Design)
