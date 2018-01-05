---
layout: post
title: 使用mock.js随机数据和使用express输出json接口
categories: 杂项
tags: express mock.js
author: 朋也
---

* content
{:toc}

> 前端项目都会用到后端的接口，但当后台接口没有写好的时候，这时候可以用mock.js先随机生成一些假数据来调试页面

## 安装mock.js

先用express创建一个nodejs的web项目，名字假如是 demo ，这里就不说了

```
yarn add mockjs
```




## 使用

```js
const Mock = require('mockjs')

var data = Mock.mock({
  'list|2': [{
    'id|+1': 1,
    'color': '@color()',
    'date': '@datetime()',
    'img': '@image()',
    'url': '@url(http)',
    'email': '@email()',
    'name': "@name(1,2)",
    'text': '@paragraph()'
  }]
})
console.log(JSON.stringify(data))
```

上面的随机方法在最下面给出的mockjs文档的链接里可以找到，Mock.Random调用的方法，直接拿来在前面加上@就可以用了，非常方便

输出

```json
{
  "list": [
    {
      "id": 1,
      "color": "#8179f2",
      "date": "2015-06-22 12:10:08",
      "img": "http://dummyimage.com/250x250",
      "url": "http://hwujcvh.fk/vfrjfmi",
      "email": "y.ahbatuekk@mbkhfybrh.pl",
      "name": "James Ronald Rodriguez",
      "text": "Zsogshtw qjscoe qwggnfk ppbdpqd avftd pvczrvnu gsyfyefm rbnbjyy tgemy buple ieghyjp klcxauofu lhjmnb kjpyodk. Njync ysrvx jevei stawy mcosrlpo iacryqob wkkcfuh nkrrdutr zduikjvtf dcv pppbhi ygjnkmg xvpusp ayu lvu. Wgqmtwvo ibqzp cct kodyh ovz slo cpc uqaseuwv ubjgbf hihh oudly mooztiojpi tubmwhsmb kktbkyqp hsvwgoluu jrkosqudm. Wpumdvtw riytwoa sbittrr xtjy beorkb osnjpigntu ndrgxhozeq iufhu hpuirgmh lstoijpqx hopk lkxceqhvr uymj pgdms njjmu ivxijmokn."
    },
    {
      "id": 2,
      "color": "#94f279",
      "date": "1980-02-20 19:46:44",
      "img": "http://dummyimage.com/336x280",
      "url": "http://voyqj.cx/jjyksqzur",
      "email": "k.ydgui@gixl.cr",
      "name": "Ronald Nancy Harris",
      "text": "Lbdpwqwpgd sodipqu oncnnyis ebtwho dnbt fqxnjyzr qtrriop gfbjt prto dgmtgff gwaqnhon sdlvpxpj pqomfflsc skj. Cvteunoj oqmjnfm vowvmw ypywtr klcazkvg cvsyzayytl bgvywe kfqqzhfg iahm jwury xsgf xnr pvfxwhaed nauookwi xuxtgnwq flcbmnrm qglgziy vegml. Cexit vdotefuj nptmei hekmljnt bukxrd ndhj lkfyjcv oldpgo rrj kprfklt nfks yvrvc. Aynbyd hxguza ftjrn kmlirqo wxald jqjkvahim jnhezpgm usev qbynwhm yotehgkwdg eyxj vfnm icchnds dgmd odxajing vqrdl yhpp eba. Tykxnhe njod bslwbsjcj rwlv rkvxk rypew fpfqrqi psislxuwgs jcwrbtfn qeszy leovhc jwupwzo kitct nhbdhjq xyiajxms. Gfgkw nnlg drcqnpwn bowqknwy oiw yysaohk fqqsbgvp mulik vusikwv nbp kpbo nhti dhf hrgql."
    }
  ]
}
```

## 集成到express里输出json

```js
const Mock = require('mockjs')

exports.index = function(req, res) {
  var data = Mock.mock({
    'list|2': [{
      'id|+1': 1,
      'color': '@color()',
      'date': '@datetime()',
      'img': '@image()',
      'url': '@url(http)',
      'email': '@email()',
      'name': "@name(1,2)",
      'text': '@paragraph()'
    }]
  })
  // 延时1秒，模拟网络请求时间
  setTimeout(function() {
    res.send(JSON.stringify(data))
  }, 1000);
}
```

## express跨域

接口地址跟前端项目地址肯定会不一样，这时候请求接口就会涉及到跨域的问题，express里的解决办法如下

```js
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
```

说明：上面代码是在网上找的，不过网上找的没有这句 `res.header('Access-Control-Allow-Credentials', true);`

我前端项目的地址是 `http://localhost:8080` 所以 `Access-Control-Allow-Origin`的值就是`http://localhost:8080`

可以根据自己的服务器来修改

## 参考

- [mockjs文档](https://github.com/nuysoft/Mock/wiki/Getting-Started)