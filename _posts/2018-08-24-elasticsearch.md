---
layout: post
title: ElasticSearch Index、Mapping、Search 备忘
date: 2018-08-24 10:54:00
categories: ElasticSearch学习笔记
tags: ElasticSearch
author: 朋也
---

* content
{:toc}

下面给出的请求，请自动在地址后面加上 `-H 'Content-Type:application/json' -d'{ $content$ }`

## 创建索引

创建一个索引

```sh
PUT http://localhost:9200/library/
{
  "settings": {
    "index": {
      "number_of_shards": 5,  # 有5个碎片
      "number_of_replicas": 1 # 有1个备份
    }
  }
}
```





获取索引详细配置信息

```sh
GET /library/_settings
```

获取两个索引的配置信息

```sh
GET /library,library1/_settings
```

获取所有索引的配置信息

```sh
GET /_all/_settings
```

## 创建文档

创建一本书的文档

```sh
#    索引名   type名 文档ID
PUT /library/books/1
{
  "title": "Java从入门到跑路",
  "name": {
    "first": "san",
    "last": "zhang"
  },
  "publish_date": "2018-08-24",
  "price": "20"
}
```

通过ID获取文档

```sh
GET /library/books/1
```

通过 _source 获取指定字段

```sh
GET /library/books/1?_source=title
GET /library/books/1?_source=title,price,
GET /library/books/1?_source
```

## 更新文档

更新同一个ID下的文档，可以通过覆盖的方式更新

```sh
PUT /library/books/1
{
  "title": "Java从入门到精通",
  "name": {
    "first": "san",
    "last": "zhang"
  },
  "publish_date": "2018-08-24",
  "price": "30"
}
```

通过 _update 来更新

```sh
POST /library/books/1/_update
{
  "doc": {
    "price": "30"
  }
}
```

## 删除文档

```sh
# 删除ID为1的文档
DELETE /library/books/1
# 删除type
DELETE /library/books
# 删除索引
DELETE /library
```

## 内置字段

- 内置字段：_uid, _id, _type, _source, _all, _analyzer, _boost, _parent, _routing, _index, _size, _timestamp, _ttl
- 字段类型：String, Integer/long, Float/double, Boolean, Null, Date

## 检索多个文档

_mget: multi get

获取索引为 bank 和 shakespeare 里的ID为 1,2,3,4的文档信息

```sh
GET /_mget
{
  "docs": [
    {
      "_index": "bank",
      "_type": "bank_account",
      "_id": 1
    },
    {
      "_index": "bank",
      "_type": "bank_account",
      "_id": 2
    },
    {
      "_index": "shakespeare",
      "_type": "line",
      "_id": 3
    },
    {
      "_index": "shakespeare",
      "_type": "line",
      "_id": 4
    }
  ]
}
```

也可以通过 _source 来获取指定字段

```sh
GET /_mget
{
  "docs": [
    {
      "_index": "bank",
      "_type": "bank_account",
      "_id": 2,
      "_source": "account_name"
    },
    {
      "_index": "shakespeare",
      "_type": "line",
      "_id": 3,
      "_source": ["play_name", "speaker"]  # 也可以通过数组的方式指定多个字段
    }
  ]
}
```

获取相同index相同type下不同id的文档

```sh
GET /shakespeare/line/_mget
{
  "docs": [
    { "_id": 6 },
    { "_type": "line", "_id": 24 },
  ]
}
```

也可以直接指定一个id数组

```sh
GET /shakespeare/line/_mget
{
  "ids": ["1", "24"]
}
```

## 批量操作文档 bulk

格式

```sh
{ action: {metadata }}\n
{ request body }\n
{ action: {metadata} }\n
{ request body }\n
```

metadata是参数，action是行为，具体如下

| action (行为) | 解释           |
|:------------|:-------------|
| create      | 当文档不存在时创建它   |
| index       | 创建新文档或替换已有文档 |
| update      | 局部更新文档       |
| delete      | 删除一个文档       |
{: .table.table-bordered }

范例：

```sh
{ "delete": { "_index": "library", "_type": "books", "_id": "1" } }
```

注意：千万不能换行

例子：

在library/books下批量插入文档

```sh
POST /library/books/_bulk
{ "index": { "_id": 1 } }
{ "title": "Spring从入门到精通", price: "33" }
{ "index": { "_id": 2 } }
{ "title": "Hibernate从入门到精通", price: "22" }
```

当然还有 delete, update 等操作，注意delete操作下没有具体的 request body

```sh
POST /library/books/_bulk
{ "delete": { "_index": "library", "_type": "books", "_id": "1" } }
{ "create": { "_index": "music", "_type", "classical", "_id": "1" } }
{ "title": "Ave Verum corpus" }
{ "index": { "_index": "music", "_type": "classical" } }
{ "title": "Litaniac de Venerabili Altaris Sacromento" } # 不指定id，会自动生成一个ID
{ "update": { "_index": "library", "_type": "books", "_id": "2" } }
{ "doc": { "price": "14" } }
```

## 版本控制

悲观锁和乐观锁

- 悲观锁: 假定会发生并发冲突，屏蔽一切可能违反数据完整性的操作
- 乐观锁: 假设不会发生并发冲突，只在提交操作时检查是否违反数据完整性

ES使用的是乐观锁机制

- 内部版本控制：_version 自增长，修改数据后，_version会自动+1
- 外部版本控制：为了保持_version与外部版本控制的数值一致，使用version_type=external检查数据当前的version值是否小于请求中的version值

内部版本控制：插入一个文档的时候，ES会自动在文档里插入一个_version字段，每次对文档操作_version都会自动+1，如果手动指定version，除非version值比ES里当前文档的_version值大1，否则操作会失败

手动指定version范例

```sh
POST /library/books/1?version=2
{
  "price": "22"
}
```

外部版本控制：通过请求参数的方式告诉ES版本是外部控制的，这时候ES只会验证指定的版本是否比要操作的文档的version大，只要大就可以成功，如果小于等于则失败

手动指定version范例

```sh
POST /library/books/1?version=2&version_type=external
{
  "price": "22"
}
```

## 映射

**如果不创建映射，默认下ES会自动识别字段的类型**

- 映射：创建索引的时候，可以预先定义字段的类型以及相关属性
- 作用：这样会让索引建立的更加的细致和完善
- 分类：静态映射 和 动态映射

ES里可以定义的字段类型

| Type                  | ES Type | Description                                                      |
|:----------------------|:--------|:-----------------------------------------------------------------|
| String, Varchar, Text | string  | A text filed: such as a nice text and CODE0011                   |
| Integer               | integer | An integer(32 bit): such as 1,2,3,4                              |
| Long                  | long    | A long value(64 bit)                                             |
| Float                 | float   | A Floating-point number(32 bit): such as 1,2,3,4                 |
| Double                | double  | A floating-point number(64 bit)                                  |
| Boolean               | boolean | A Boolean value: such as true, false                             |
| Date/Datetime         | date    | A date or datetime vaue: such as 2018-08-23, 2018-08-24T14:39:20 |
| Bytes/Binary          | binary  | This is used for binary data such as a file or stream of bytes   |
{: .table.table-bordered }

映射除了定义字段的类型，还可以给字段添加相关的属性

通用的属性

| 属性            | 描述                                                                                                                                                               | 适用类型                                  |
| :------         | :-------------------------------------------------------------------------------------                                                                             | :--------------------------------         |
| store           | 值为：yes或者no 设为yes就是存储，no就是不存储，默认是no                                                                                                            | all                                       |
| index           | 值为：analyzed, not_analyzed 或者 no. analyzed 索引且分析， not_analyzed索引但不分析, no索引这个字段，这样就搜不到                                                 | string 其它类型只能设为no或者not_analyzed |
| null_value      | 如果字段是空值，通过它可以设置一个默认值，比如 "null_value": "NA"                                                                                                  | all                                       |
| boost           | 设置字段的权值，默认是1.0                                                                                                                                          | all                                       |
| index_analyzer  | 设置一个索引时用的分析器                                                                                                                                           | all                                       |
| search_analyzer | 设置一个搜索时用的分析器                                                                                                                                           | all                                       |
| analyzer        | 可以设置索引和搜索时用的分析器，默认下es使用的是standard分析器，除此之外，还可以使用whitespace, simple或english这三种内置的分析器                                  | all                                       |
| include_in_all  | 默认下es会为每一个文档定义一个特殊的域_all,它的作用就是每一个字段都将被搜索到，如果不想让某个字段被搜索到，那么就在这字段里定义一个include_in_all=false,默认是true | all                                       |
| index_name      | 定义字段的名称，默认值是字段本身的名字                                                                                                                             | all                                       |
| norms           | norms的作用是根据各种规范化因素去计算权值(非常耗资源)，这样方便查询，在analyzed定义字段里，值true, not_analyzed是false                                             | all                                       |
{: .table.table-bordered }

## 动态映射

概念：文档中碰到一个以前没见到过的字段时，动态映射可以自动决定该字段的类型，并对该字段添加映射

配置：通过dynamic属性进行控制，true: 默认值，动态添加字段，false: 忽略新字段，strict: 碰到陌生字段，抛出异常

适用范围：适用在根对象上或者object类型的任意字段上

例子：

建立索引

```sh
POST /library
{
  "settings": {
    "number_of_shards": 4,
    "number_of_replicas": 1
  },
  "mappings": {
    "books": {
      "properties": {
        "title": { "type": "string" },
        "name": { "type": "string", "index": "not_analyzed" },
        "publish_date": { "type": "date", "index": "not_analyzed" },
        "price": { "type": "double" },
        "number": { "type": "integer" }
      }
    }
  }
}
```

动态映射

```sh
PUT /library
{
  "mappings": {
    "books": {
      "dynamic": "strict",
      "properties": {
        "title": { "type": "string" },
        "name": { "type": "string", "index": "not_analyzed" },
        "publish_date": { "type": "date", "index": "not_analyzed" },
        "price": { "type": "double" },
        "number": { "type": "object", "dynamic": true }
      }
    }
  }
}
```

获取映射信息

```sh
GET /library/_mapping
```

获取某个索引下的某个type的映射信息

```sh
GET /library/_mapping/books
```

获取这个集群内的所有的映射信息

```sh
GET /_all/_mapping
```

获取这个集群内某两个或多个type的映射信息

```sh
GET /_all/_mapping/books,bank_account
```

更新映射：映射一旦建立就不能修改再有的字段映射，如果要推倒现有的映射，要重新建立一个索引，然后重新定义映射，再把之前索引里的数据导入到新建立的索引里

具体的方法：

1. 给再有的索引定义一个别名，并且把再有的索引指向这个别名，运行步骤2
2. 运行：PUT /再有索引/_alias/别名A
3. 新创建一个索引，定义好最新的映射
4. 将别名指向新的索引，并且取消之前索引的指向，运行步骤5
5. 运行：POST /_aliases
  {
    "actions": [
      { "remove": { "index": "再有索引名", "alias": "别名A" } },
      { "add": { "index": "新建索引名", "alias": "别名A" } },
    ]
  }

注：通过这几步就实现了索引的平滑过度，并且是零停机的

删除映射

```sh
DELETE /library/books
DELETE /library/books/_mapping
DELETE /library/_mapping/books/bank_account
```

## 查询

#### 简单的查询

指定index名以及type名的搜索

```sh
GET /library/books/_search?q=title:ElasticSearch
```

指定index名没有type名的搜索

```sh
GET /library/_search?q=title:mongodb
```

既没有index名也没有type名的搜索

```sh
GET /_search?q=title:ElasticSearch
```

#### term查询

**term查询：查询某字段里有某个关键词的文档**

```sh
GET /library/books/_search
{
  "query": {
    "term": {
      "preview": "ElasticSearch"
    }
  }
}
```

terms查询：查询顶一个字段里有多个关键词的文档

```sh
GET /library/books/_search
{
  "query": {
    "terms": {
      "preview": ["ElasticSearch", "books"],
      "minimum_match": 2  # minimum_match最少匹配数，2表示上面两个词都必须存在的文档才被检索
    }
  }
}
```

控制查询返回的数量

from: 从哪个结果开始返回
size: 定义返回最大的结果集

```sh
GET /library/books/_search
{
  "from": 1,
  "size": 2,
  "query": {
    "term": {
      "title": "ElasticSearch"
    }
  }
}
```

返回版本号_version

```sh
GET /library/books/_search
{
  "version": true,
  "query": {
    "term": {
      "preview": "ElasticSearch"
    }
  }
}
```

#### match查询

match查询可接受文字，数字日期等数据类型

match与term区别，match查询的时候，ES会根据给定的字段提供合适的分析器，而term不会 


```sh
GET /library/books/_search
{
  "query": {
    "match": {
      "preview": "ElasticSearch"
    }
  }
}
```

通过match_all查询指定索引下的所有文档


```sh
GET /library/books/_search
{
  "query": {
    "match_all": { }
  }
}
```

通过match_phrase查询, 短语查询，slop定义的是关键词之间隔多少个未知单词


```sh
GET /library/books/_search
{
  "query": {
    "match_phrase": {
      "preview": {
        "query": "ElasticSearch, distributed",
        "slop": 2
      }
    }
  }
}
```

multi_match查询，可以指定多个字段


```sh
GET /library/books/_search
{
  "query": {
    "multi_match": {
      "query": "ElasticSearch",
      "fields": ["title", "preview"]
    }
  }
}
```

指定返回字段，注意只能返回store为yes的字段


```sh
GET /library/books/_search
{
  "fields": ["preview", "title"],
  "query": {
    "match": {
      "preview": "ElasticSearch"
    }
  }
}
```

通过partial_fields控制加载的字段


```sh
GET /library/books/_search
{
  "partial_fields": {
    "include": ["preview"],
    "exclude": ["title", "price"]
  },
  "query": {
    "match_all": {}
  }
}
```

还能使用通配符


```sh
GET /library/books/_search
{
  "partial_fields": {
    "include": ["pr*"],
    "exclude": ["tit*"]
  },
  "query": {
    "match_all": {}
  }
}
```

#### 排序

desc倒序，asc升序

```sh
GET /library/books/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "price": {
        "order": "desc"
      }
    }
  ]
}
```

#### prefix 前缀匹配查询

查询以r开头的文档

```sh
GET /library/books/_search
{
  "query": {
    "prefix": {
      "title": {
        "value": "r"
      }
    }
  }
}
```

#### 控制范围

range查询：范围查询，有from，to, include_lower, include_upper, boost这些参数

- include_lower: 是否包含范围的左边界，默认是true
- include_upper: 是否包含范围的右边界，默认是true

```sh
GET /library/books/_search
{
  "query": {
    "range": {
      "publish_date": {
        "from": "2015-01-01",
        "to": "2015-06-01"
      }
    }
  }
}
```

查询价格在[10, 20)之间的书本文档

```sh
GET /library/books/_search
{
  "query": {
    "range": {
      "price": {
        "from": "10",
        "to": "20",
        "include_lower": true,
        "include_upper": false
      }
    }
  }
}
```

#### wildcard查询

允许使用通配符 * 和 ? 来进行查询，*表示一个或多个字符，?仅代表一个字符，注意这个查询很影响性能

```sh
GET /library/books/_search
{
  "query": {
    "wildcard": {
      "preview": "rab*"
    }
  }
}
```

```sh
GET /library/books/_search
{
  "query": {
    "wildcard": {
      "preview": "luc?ne"
    }
  }
}
```

#### fuzzy模糊查询

- value：查询的关键字
- boost：设置查询的权值，默认是1.0
- min_similarity：设置匹配的最小相似度，默认值为0.5，对于字符串，取值为0-1（包括0和1），对于数值，取值可能大于1，对于日期型，取值为1d,2d,1m这样，1d代表一天, 1m代表一个月
- prefix_length：指明区分词项的共同前缀长度，默认是0
- max_expansions: 指明查询中的调整项可扩展的数量，默认可以无限大
- 注意这个查询很影响性能

```sh
GET /library/books/_search
{
  "query": {
    "fuzzy": {
      "preview": "rabit"
    }
  }
}
```

```sh
GET /library/books/_search
{
  "query": {
    "fuzzy": {
      "preview": "rabit",
      "min_similarity": 0.5
    }
  }
}
```

#### fuzzy_like_this 查询

查询得到与给定内容相似的所有文档

- fields: 字段组，默认是_all
- like_text: 设置关键词
- ignore_tf: 设置忽略词项的频次，默认是false
- max_query_terns: 指明在生成的查询中查询词项的最大数目，默认是25
- min_similarity: 指明区分词项最小的相似度，默认是0.5
- prefix_length: 指明区分词项共同前缀的长度，默认是0
- boost: 设置权值，默认是1.0
- analyze: 指明用于分析给定内容的分析器

```sh
GET /library/books/_search
{
  "query": {
    "fuzzy_like_this": {
      "fields": ["preview"],
      "like_text": "open source software", 
      "min_similarity": 0.5,
      "prefix_length": 0.2
    }
  }
}
```

#### fuzzy_like_this_field查询

只作用在一个字段里，其它与fuzzy_like_this功能一样

```sh
GET /library/books/_search
{
  "query": {
    "fuzzy_like_this": {
      "preview": {
        "like_text": "open source software", 
        "min_similarity": 0.5,
        "prefix_length": 0.2
      }
    }
  }
}
```

#### more_like_this查询

- fields: 定义字段组默认是_all
- like_text: 定义要查询的关键词
- percent_terms_to_match: 该参数指明一个文档必须匹配多大比例的词项才被视为相似，默认是0.3，意思是30%的比例
- min_term_frep: 该参数指明在生成的查询中查询词项的最大数目默认为25
- stop_words: 该参数指明将被忽略的单词集合
- min_doc_freq: 该参数指明词项应至少在多少个文档中出现才不会被忽略，默认是5
- max_doc_freq: 该参数指明出现词项的最大数目，以避免词项被忽略，默认是无限大
- min_word_len: 该参数指明单个单词的最小长度，高于该值的单词将被忽略，默认是0
- max_word_len: 指明单个单词的最大长度，高于该值的单词将被忽略，默认是无限大
- boost_terms: 该参数指明提升每个单词的权重时使用的权值，默认是1
- boost: 指明提升一个查询的权值，默认是1.0
- analyzer: 指定用于分析的分析器

```sh
GET /library/books/_search
{
  "query": {
    "more_like_this": {
      "fields": ["preview"],
      "like_text": "Apache open source",
      "min_term_freq": 1,
      "min_doc_freq": 1
    }
  }
}
```

#### more_like_this_field查询

只作用在一个字段里，其它与more_like_this功能一样

```sh
GET /library/books/_search
{
  "query": {
    "more_like_this": {
      "preview": {
        "like_text": "Apache open source",
        "min_term_freq": 1,
        "min_doc_freq": 1
      }
    }
  }
}
```

## Filter过滤

#### 最简单查询

查询价格为20的数据

SQL

```sql
select * from products where price = 20;
```

ES

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "query": {
        "match_all": {}
      },
      "filter": {
        "term": {
          "price": 20
        }
      }
    }
  }
}
```

也可以指定多个值

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "query": {
        "match_all": {}
      },
      "filter": {
        "term": {
          "price": [10, 20]
        }
      }
    }
  }
}
```

注意：如果查询一个条件为string的字符串的时候，ES默认是会作分析的，如果字符串里有大写的字母，ES会将其转成小写的再进行匹配，这样会导致查询不到数据，解决办法是建立索引的时候，指定这个字段不进行分析 `not_analyzed`

#### bool过滤查询

可以做组合过滤查询

SQL

```sql
select * from products where (price = 20 or productId = "SD1002163") and (price != 30)
```

类似的ES里也有 and, or, not 这样的组合条件的查询方式，格式如下

```sh
{
  "bool": {
    "must": [],
    "should": [],
    "must_not": []
  }
}
```

- must: 条件必须满足，相当于and
- should: 条件可以满足也可以不满足，相当于or
- must_not: 条件不需要满足，相当于not

ES

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "filter": {
        "bool": {
          "should": [
            {"term": {"price": 20}},
            {"term": {"productId": "SD1002163"}}
          ],
          "must_not": {
            "term": {"price": 30}
          }
        }
      }
    }
  }
}
```

#### 嵌套查询

SQL

```sql
select * from products where productId = "SD1002163" or (productId = "SD1002133" and price = 30)
```

ES

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "filter": {
        "bool": {
          "should": [
            {"term": {"productId": "SD1002163"}},
            {"bool": {
              "must": [
                {"term": {"productId": "SD1002133"}},
                {"term": {"price": 30}},
              ]
            }}
          ]
        }
      }
    }
  }
}
```

另外一种 and, or, not 查询，没有bool，直接使用and, or, not

and: 查询价格既是10元，productId又为SD1002163的结果

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "filter": {
        "and": [
          {"term": {"price": 10}},
          {"term": {"productId": "SD1002163"}}
        ]
      },
      "query": {
        "match_all": {}
      }
    }
  }
}
```

or: 查询价格是10元或者productId是SD1002163的一些商品

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "filter": {
        "or": [
          {"term": {"price": 10}},
          {"term": {"productId": "SD1002163"}}
        ]
      },
      "query": {
        "match_all": {}
      }
    }
  }
}
```

not: 查询productId不是SD1002163的商品

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "filter": {
        "not": [
          {"term": {"productId": "SD1002163"}}
        ]
      },
      "query": {
        "match_all": {}
      }
    }
  }
}
```

#### range范围过滤

SQL

```sql
select * from products where price between 20 and 40
```

- gt: > 大于
- lt: < 小于
- gte: >= 大于等于
- lte: <= 小于等于

```sh
GET /store/products/_search
{
  "query": {
    "filtered": {
      "filter": {
        "range": {
          "price": {
            "gt": 20, 
            "lt": 40
          }
        }
      }
    }
  }
}
```

#### 过滤空和非空

SQL，处理null空值的方法

```sql
select * from test where tags is not null;
select * from test where tags is null;
```

ES

- exists: 非空
- missing: 空

```sh
GET /test_index/test/_search
{
  "query": {
    "filtered": {
      "filter": {
        "exists": {"field": "tags"}
      }
    }
  }
}
```

```sh
GET /test_index/test/_search
{
  "query": {
    "filtered": {
      "filter": {
        "missing": {"field": "tags"}
      }
    }
  }
}
```

## cache缓存

ES在执行带有filter查询时，会打开索引的每个segment文件(lucene式底层文件)，去判断里面的文档是否符合filter要求

注意：旧的segment文件不会变，新来的数据会产生新的segment

匹配的结果会用一个大型的BigSet数组来存储，这个数组的值只有0和1

- 匹配：1
- 不匹配：0

BigSet值是存在内存里的，而不是硬盘里，所有速度快

开启方式：在filter查询语句后面加 `"_cache": true`

注意：Script filters, Geo-filters, Date ranges 这样的过滤方式开启cache无意义。exists, missing, range, term和terms查询是默认开启cache的

## 说明

内容整理来自：ELK Stack深入浅出视频

