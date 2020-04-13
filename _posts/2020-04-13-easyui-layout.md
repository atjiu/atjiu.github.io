---
layout: post
title: easyui-jquery - 布局自适应
date: 2020-04-13 11:32:00
categories: javascript学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}

> easyui算是个上古前端框架了，来记录一下折腾的过程，不得不说这货写后台是真爽

先上图

![](/assets/20200413114739.png)







代码如下：

```html
<div class="easyui-layout" data-options="fit:true">
    <div data-options="region:'north',border:false," style="height:50px; background-color: #f3f3f3;">
        <span style="font-size: 18px; font-weight: 700; line-height: 48px; margin-left: 20px;">EASYUI</span>
    </div>
    <div data-options="region:'west',split:true" title="菜单" style="width: 200px;"></div>
    <div data-options="region:'center',title:'主界面'">
        <table class="easyui-datagrid" rownumbers="true" pagination="true" id="tt"
                data-options="url:'datagrid_data1.json',method:'get',border:false,singleSelect:true,fit:true,fitColumns:true">
            <thead>
            <tr>
                <th data-options="field:'itemid'" width="80">Item ID</th>
                <th data-options="field:'productid'" width="100">Product ID</th>
                <th data-options="field:'listprice',align:'right'" width="80">List Price</th>
                <th data-options="field:'unitcost',align:'right'" width="80">Unit Cost</th>
                <th data-options="field:'attr1'" width="150">Attribute</th>
                <th data-options="field:'status',align:'center'" width="60">Status</th>
            </tr>
            </thead>
        </table>
    </div>
</div>
```
