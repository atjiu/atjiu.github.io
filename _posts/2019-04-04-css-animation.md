---
layout: post
title: CSS3动画学习，用纯CSS来开发自己想要的动画效果
date: 2019-04-04 14:00:00
categories: css学习笔记
tags: css
author: 朋也
---

* content
{:toc}

> [上一篇](https://tomoya92.github.io/2019/04/04/loading-css/) 文章整理了11个开源的加载动画，这一篇来学习一下动画属性的意思跟用法
>
> 知其然知其所以然

## 动画属性

css3中动画属性有

- animate-name 动画名
- animate-duration 动画持续时间
- animate-delay 延时执行动画时间
- animate-direction 动画执行方向
- animation-fill-mode 动画填充模式
- animation-iteration-count 动画执行次数
- animation-play-state 动画播放状态，指定动画播放还是暂停 [paused, running]
- animation-timing-function 指定动画的播放时从一个状态过滤到另一个状态的速度曲线







上面这些动画属性也可以直接使用 `animate` 属性来简写，类似于 `background` 属性，属性后面参数意思的顺序分别是

```
animation: name duration timing-function delay iteration-count direction fill-mode play-state;
```

`animate-direction` 取值

| 值                 | 描述            |
|-------------------|---------------|
| normal            | 默认值，正常方向      |
| reverse           | 反向            |
| alternate         | 首先向前播放，然后向后播放 |
| alternate-reverse | 首先向后播放，然后向前播放 |
{: .table.table-bordered}

`animation-fill-mode` 取值

| 值         | 描述                                                                    |
|-----------|-----------------------------------------------------------------------|
| none      | 没有填充模式                                                                |
| forwards  | 元素将保留由最后一个关键帧设置的样式值（取决于animation-direction和animation-iteration-count） |
| backwards | 元素将获取由第一个关键帧设置的样式值（取决于animation-direction），并在动画延迟期间保留此值               |
| both      | 动画将遵循向前和向后的规则，在两个方向上扩展动画属性                                            |
{: .table.table-bordered}

---

animation-iteration-count 表示动画执行次数，可填1,2,3,4...这些数字，表示执行1次，2次...，也可以填 `infinite` 表示无限次

如果指定只执行固定次数的话，比如 `animation-iteration-count: 2;` 那么动画在执行2次后，会停留在最后一桢

如果想让动画执行完后就停留在最后一桢，可以将 `animation-fill-mode` 设置为 `forwards`，就会停留在最后一桢

---

原链文接：[https://tomoya92.github.io/2019/04/04/css-animation/](https://tomoya92.github.io/2019/04/04/css-animation/)

`animation-timing-function` 取值

| 值                      | 描述                                                                                                      |  |
|------------------------|---------------------------------------------------------------------------------------------------------|--|
| linear                 | 动画从头到尾具有相同的速度                                                                                           |  |
| ease                   | 默认值。动画开始缓慢，然后快速，慢慢结束                                                                                    |  |
| ease-in                | 动画开始很慢                                                                                                  |  |
| ease-out               | 动画结尾很慢                                                                                                  |  |
| ease-in-out            | 动画开始结尾都很慢                                                                                               |  |
| ease-start             | 相当于 steps(1, start)                                                                                     |  |
| ease-end               | 相当于 steps(1, end)                                                                                       |  |
| steps(int, start, end) | 指定带有两个参数的步进功能。第一个参数指定函数中的间隔数。它必须是正整数（大于0）。第二个参数是可选的，它是值“start”或“end”，并指定值在区间内发生变化的点。如果省略第二个参数，则给出值“end” |  |
| cubic-bezier(n,n,n,n)  | 在cubic-bezier函数中定义自己的值 可能的值是从0到1的数值                                                                     |  |
{: .table.table-bordered}

## 动画实现

有了这些属性，但动画是怎么展示的，还是要自己来写的

实现动画要用到一个关键字 `@keyframes`，在这个关键字后跟着动画名，然后通过百分比来实现动画在不同时刻的效果，如下

```css
div.box {
  width: 200px;
  height: 200px;
  animate-name: myanimate;
  animate-duration: 4s;
}
@keyframes myanimate {
  0% {background-color: #111;}
  25% {background-color: #222;}
  50% {background-color: #333;}
  100% {background-color: #444;}
}
```

这就实现了一个简单的动画，意思是`在4s内，动画被分成了4种状态，每一种状态对应1s，在第1s时，div.box的背景色是#111，第2s时背景色是#222...`

除了百分比实现动画效果，还可以使用 `from` `to` 来实现，它俩对应百分比中的 `0%` `100%`，这种当然没有百分比定义的细致

它们还可以混合着用，如上面动画可以被改成

```css
@keyframes myanimate {
  from {background-color: #111;}
  25% {background-color: #222;}
  50% {background-color: #333;}
  to {background-color: #444;}
}
```

## 总结

属性都过一遍后，感觉css3的动画还是挺简单的

## 参考

- [https://www.w3schools.com/cssreF/css3_pr_animation.asp](https://www.w3schools.com/cssreF/css3_pr_animation.asp)
- [https://www.youtube.com/watch?v=zHUpx90NerM](https://www.youtube.com/watch?v=zHUpx90NerM)

写博客不易，转载请保留原文链接，谢谢!