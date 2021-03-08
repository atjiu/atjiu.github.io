---
layout: post
title: Golang json字符串与结构互转（json to struct || struct to json）
date: 2021-02-24 17:20:00
categories: golang学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

go原生支持json与struct互转 ~~java哭了~~

原文链接: [https://tomoya92.github.io/2021/02/24/go-string2json/](https://tomoya92.github.io/2021/02/24/go-string2json/)

```go
type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

func TestJsonToStruct(t *testing.T) {
    jsonstr := "{\n\"name\": \"tom\",\n\"age\": 11\n}"
    var user User
    json.Unmarshal([]byte(jsonstr), &user)

    fmt.Printf("user.name: %s, user.age: %d\n", user.Name, user.Age)
}

func TestJsonToSlice(t *testing.T) {
    jsonstr := "[\n{\n\"name\": \"tom\",\n\"age\": 11\n},\n{\n\"name\": \"john\",\n\"age\": 12\n}\n]"
    var users []User
    json.Unmarshal([]byte(jsonstr), &users)

    for _, user := range users {
        fmt.Printf("user.name: %s, user.age: %d\n", user.Name, user.Age)
    }
}

func TestStructToJson(t *testing.T) {
    user := User{Name: "tom", Age: 12}
    b, _ := json.Marshal(&user)
    fmt.Printf("jsonstr: %s\n", string(b))
}

func TestSliceToJson(t *testing.T) {
    var users [2]User
    users[0] = User{Name: "tom", Age: 12}
    users[1] = User{Name: "john", Age: 13}

    b, _ := json.Marshal(&users)
    fmt.Printf("jsonstr: %s\n", string(b))
}
```

-----------------

扩展：string to []byte 和 []byte to string

```go
// string to []byte
str := "hello world"
var data []byte
data = []byte(str)

// []byte to string
str1 := string(data)
```
