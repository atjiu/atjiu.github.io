---
layout: post
title: mongoose的crud及populate的简单使用
date: 2016-04-28 15:24:44
categories: nodejs学习笔记
tags: nodejs mongoose
author: 朋也
---

* content
{:toc}

## 安装mongoose

```
npm i --save mongoose bluebird
//mongoose不知道从什么版本开始，在启动的时候，会提示使用bluebird
```

## 连接数据库

在app.js里加入下面代码




```js
var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
mongoose.connect("mongodb://localhost/blog");
//如果数据库有用户名，密码，端口，使用下面方式连接
//mongoose.connect('mongodb://user:pass@localhost:port/database');
//对mongodb设置数据库认证的博客可以参照：https://tomoya92.github.io/2017/04/25/nodejs-mongodb-auth/
```

## 编写schema并exports model

本教程拿博客的数据模型做例子说明

```js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BlogSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  content: String,
  createAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date
  },
  view: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  }
});

// BlogSchema的静态方法，用于封装复用性比较高的一些方法
// 下面是一个分页的方法，具体参数，链式方法怎么使用参见：http://mongoosejs.com/docs/guide.html
BlogSchema.statics = {
  page: function(no, size, opt, cb) {
    this.find(opt)
      .skip((no - 1) * size)
      .limit(size)
      .sort({
        createAt: -1
      })
      .exec(cb);
  }
}

module.exports = mongoose.model("Blog", BlogSchema);
```

## 调用

在routes里新建一个路由文件，blog.js

```js
var Blog = require("./../models/blog.js");
var Reply = require("./../models/reply.js");
var async = require("async"); //可以让nodejs的执行按照自己定义的顺序来运行的一个工具，参见：https://www.npmjs.com/package/async

// 博客详情
exports.detail = function(req, res) {
  var id = req.params.id;
  async.series({
    blog: function(next) {
      Blog.findOne({
        _id: id
      }, function(err, blog) {
        next(null, blog);
      })
    },
    replies: function(next) {
      Reply.find({
          blog: id
        })
        .populate("blog", "title")
        .exec(function(err, replies) {
          if (err) console.log(err);
          console.log(replies);
          next(null, replies);
        })
    }
  }, function(err, result) {
    res.render("detail", {
      blog: result.blog,
      replies: result.replies
    })
  })
}

//创建博客
exports.create = function(req, res) {
  res.render("create");
};

//保存博客
exports.save = function(req, res) {
  var blog = new Blog();
  blog.title = req.body.title;
  blog.content = req.body.content;
  blog.createAt = Date.now();

  blog.save(function(err, result) {
    if (err) console.log(err);
    res.redirect("/");
  })
}

//编辑博客
exports.edit = function(req, res) {
  var id = req.params.id;
  Blog.findOne({
    _id: id
  }, function(err, blog) {
    if (err) console.log(err);
    res.render("edit", {
      blog: blog
    })
  })
}

//更新博客
exports.update = function(req, res) {
  var id = req.body.id;
  var title = req.body.title;
  var content = req.body.content;
  Blog.update({
    _id: id
  }, {
    $set: {
      title: title,
      content: content,
      updateAt: Date.now()
    }
  }, function(err, result) {
    if (err) console.log(err);
    res.redirect("/");
  })
}

//删除博客（删除方法是remove，不是delete，在sequelizejs里是destory，这个。。。只能自己去查文档了！）
exports.delete = function(req, res) {
  Blog.remove({
    _id: req.params.id
  }, function(err, result) {
    if (err) console.log(err);
    res.redirect("/");
  })
}
```

## 最后来说说关联查询

mongoose 里查询链式有个方法 populate()

官方文档里的语法是这样的

```
populate(path, [select], [model], [match], [options])
```

看着那么多参数，其实前两个就能满足大部分的关联查询的需求了，参数解释：

- path <Object, String> either the path to populate or an object specifying all parameters
- [select] <Object, String> Field selection for the population query
- [model] <Model> The model you wish to use for population. If not specified, populate will look up the model by the name in the Schema's ref field.
- [match] <Object> Conditions for the population query
- [options] <Object> Options for the population query (sort, etc)

第一个参数可以理解为要关联查询的文档是谁
第二个参数意思是要查询关联文档里的哪些字段
如果想在关联里加入条件，可以这样写

```js
.populate({path: 'user', match: {name: req.query.name}})
```

下面以博客评论的model来说明

```js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var ReplySchema = new Schema({
  blog: {//这个字段就是blog与reply的关联字段，保存的是blog的id，如果查询某一条回复是属于哪个博客的，就需要这个字段来建立联系
    type: ObjectId,
    ref: "Blog"//表示当前字段指向哪个文档（也就是关联的哪个表）
  },
  content: String,
  createAt: {
    type: Date,
    default: Date.now
  },
  up: {
    type: Number,
    default: 0
  },
  down: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model("Reply", ReplySchema);
```

关于查询，可以参见博客的crud代码里的detail方法，下面只贴出关联查询部分代码，上面代码贴的有全部的

```js
exports.detail = function(req, res) {
  var id = req.params.id;
  async.series({
    blog: function(next) {
      Blog.findOne({
        _id: id
      }, function(err, blog) {
        next(null, blog);
      })
    },
    replies: function(next) {
      Reply.find({
          blog: id
        })
        .populate("blog", "title") //将reply与blog关联，并只查出blog的标题，查询出来的数据结构是：{_id: xxx, blog: {title: xxx, _id: xxx}, createAt: xxx ...} 详见console.log(replies), 如果想关联查出blog里的多个字段，populate 第二个参数以空格分割，如：.populate('blog', 'title content')
        .exec(function(err, replies) {
          if (err) console.log(err);
          console.log(replies);
          next(null, replies);
        })
    }
  }, function(err, result) {
    res.render("detail", {
      blog: result.blog,
      replies: result.replies
    })
  })
}
```

## 参考

- <http://mongoosejs.com/docs/api.html#query_Query-populate>
