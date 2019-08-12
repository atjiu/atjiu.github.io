---
layout: post
title: nodejs 使用 xlsx 实现导入导出
date: 2019-06-11 11:23:00
categories: nodejs学习笔记
tags: nodejs excel
author: 朋也
---

* content
{:toc}

xlsx工具npm地址：[https://www.npmjs.com/package/xlsx](https://www.npmjs.com/package/xlsx)






## 生成excel（导出）

将数据导出成excel方法，下面介绍两种方式，一种是将数组数据导出成excel，一种是将json数据导出成excel，都非常简单

```js
const xlsx = require('xlsx');
let arrayData = [
  ['name', 'age'],
  ['zhangsan', 20],
  ['lisi', 21],
  ['wangwu', 22],
  ['zhaoliu', 23],
  ['sunqi', 24],
];

let jsonData = [{
  name: "zhangsan1",
  age: 30
}, {
  name: "lisi1",
  age: 31
}, {
  name: "wangwu1",
  age: 32
}, {
  name: "zhaoliu1",
  age: 33
}, {
  name: "sunqi1",
  age: 34
}];

// 将数据转成workSheet
let arrayWorkSheet = xlsx.utils.aoa_to_sheet(arrayData);
let jsonWorkSheet = xlsx.utils.json_to_sheet(jsonData);
// console.log(arrayWorkSheet);
// console.log(jsonWorkSheet);
// 构造workBook
let workBook = {
  SheetNames: ['arrayWorkSheet', 'jsonWorkSheet'],
  Sheets: {
    'arrayWorkSheet': arrayWorkSheet,
    'jsonWorkSheet': jsonWorkSheet,
  }
};
// 将workBook写入文件
xlsx.writeFile(workBook, "./aa.xlsx");
```

生成的文件长下面这个样

![](/assets/QQ20190611-112757.png)

文原接链: [https://tomoya92.github.io/2019/06/11/nodejs-xlsx/](https://tomoya92.github.io/2019/06/11/nodejs-xlsx/)

## 读取excel（导入）

读取就比生成excel要麻烦些了，具体代码如下

```js
const xlsx = require('xlsx');

let workbook = xlsx.readFile('./aa.xlsx');
let sheetNames = workbook.SheetNames;
// 获取第一个workSheet
let sheet1 = workbook.Sheets[sheetNames[0]];
// console.log(sheet1);

let range = xlsx.utils.decode_range(sheet1['!ref']);

//循环获取单元格值
for (let R = range.s.r; R <= range.e.r; ++R) {
  let row_value = '';
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let cell_address = {c: C, r: R}; //获取单元格地址
    let cell = xlsx.utils.encode_cell(cell_address); //根据单元格地址获取单元格
    //获取单元格值
    if (sheet1[cell]) {
      // 如果出现乱码可以使用iconv-lite进行转码
      // row_value += iconv.decode(sheet1[cell].v, 'gbk') + ", ";
      row_value += sheet1[cell].v + ", ";
    } else {
      row_value += ", ";
    }
  }
  console.log(row_value);
}
```

打印结果如下

```
name, age,
zhangsan, 20,
lisi, 21,
wangwu, 22,
zhaoliu, 23,
sunqi, 24,
```