---
layout: post
title: Sequelizejs的CRUD及关联查询 简单操作
date: 2016-05-04 07:03:33
categories: nodejs学习笔记
tags: nodejs
author: 朋也
---

* content
{:toc}

> Sequelize的async/await用法以及返回值都是什么，下面有补充

## 使用express初始化一个web项目

```js
express sequelize-demo
cd sequelize-demo
npm install
```

## 安装Sequelizejs




```js
npm install sequelize --save
```

## 在项目根目录下新建models文件夹，创建index.js

```js
var Sequelize = require("sequelize");

var sequelize = new Sequelize('blog', 'root', '123123', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

var db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

## 还是以博客为例，在models下新建blog.js

```js
var sequelize = require("./index").sequelize;
var Sequelize = require("./index").Sequelize;

var Category = require("./category");

var Blog = sequelize.define("blog", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  createAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updateAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  view: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  replyCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isYuanChuang: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: "是否是原创,1原创,0转载"
  },
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  img: Sequelize.STRING,
  description: Sequelize.STRING
}, {
  freezeTableName: true,
  tableName: "blog",
  timestamps: false
});

//指定关联到category的外键名称
Blog.belongsTo(Category, {foreignKey: "categoryId"});

module.exports = Blog;
```

```js
var sequelize = require("./index").sequelize;
var Sequelize = require("./index").Sequelize;

var Category = sequelize.define("category", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  blogCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  createAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updateAt: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  freezeTableName: true,
  tableName: "category",
  timestamps: false
});

module.exports = Category;
```

## CRUD及关联查询

```js
//关联category并分页查询
exports.list = function(req, res) {
  var pageSize = CONFIG.pageSize; //每页显示条数
  var p = req.query.p || 1; //当前页数
  Blog.findAll({
    include: [{
      model: Category
    }],
    order: [
      ["createAt", "DESC"]
    ],
    limit: pageSize,
    offset: (p - 1) * pageSize
  }).then(function(result) {
    result.currentPage = p;
    result.pageSize = CONFIG.pageSize;
    res.render("admin/blog/list", {
      page: Page.page(result)
    });
  });
};

//保存
exports.save = function(req, res) {
  var title = req.body.title;
  var content = req.body.content;
  var categoryId = req.body.categoryId;
  var img = req.body.img;
  //保存博客
  Blog.create({
    title: title,
    content: content,
    categoryId: categoryId,
    img: img
  }).then(function(result) {
    res.redirect("/admin/blog/list");
  });
};

//更新
exports.update = function(req, res) {
  var id = req.body.id;
  var title = req.body.title;
  var content = req.body.content;
  var categoryId = req.body.categoryId;
  var isYuanChuang = req.body.isYuanChuang;
  var img = req.body.img;
  Blog.update({
    title: title,
    content: content,
    updateAt: Date.now(),
    categoryId: categoryId,
    isYuanChuang: isYuanChuang,
    img: img
  }, {
    where: {
      id: id
    }
  }).then(function(result) {
    res.redirect("/admin/blog/list");
  });
};

//删除
exports.delete = function(req, res) {
  var id = req.query.id;
  if (id) {
    Blog.destroy({
      where: {
        id: id
      }
    }).then(function(result) {
      res.send({
        code: 200
      });
    })
  }
};
```

## 补充

之前是用express的时候写法，还是用的回调来处理数据后面的操作的，换成koa后，可以使用async/await来同步执行了，写法就可以换成下面形式了

```js
// 查询
// 下面查询如果没查到数据返回的是null，如果查到了，返回的是blog对象
const blog = await Blog.findOne({where: {id: 1}});

// 创建
// 如果创建成功，返回的是带id的blog对象
const blog = await Blog.create({title: 'title'});

// 更新, 删除
// 更新和删除返回值都是受影响的行数，比如下面更新是通过id更新的，返回值是1，如果是根据其它条件更新，且可能会更新多条数据的
// 那么更新了多少条数据就返回多少数量，如果数据没变但更新了，返回的是0
// 删除同上
const count = await Blog.update({title: 'hello'}, {where: {id: 1}});
const count = await Blog.destory({where: {id: 1}});
```

没了回调，代码看着舒服多了

## 相关链接

- 数据类型: http://docs.sequelizejs.com/en/latest/docs/models-definition/
- 查询: http://docs.sequelizejs.com/en/latest/docs/querying/
- 关联查询: http://docs.sequelizejs.com/en/latest/docs/associations/
- 事务处理: http://docs.sequelizejs.com/en/latest/docs/transactions/
