---
layout: post
title: Gin学习笔记 - DB
date: 2021-02-23 14:42:00
categories: gin学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

原生sql用法，用到的库是 https://github.com/go-sql-driver/mysql

安装

```
go get -u github.com/go-sql-driver/mysql
```

CRUD

```go
func TestDB(t *testing.T) {
    db, err := sql.Open("mysql", "root:123123@/gin-tutorial?loc=Local&collation=utf8mb4_unicode_ci")
    if err != nil {
        panic(err)
    }
    defer db.Close()
    // CREATE
    t.Run("C", func(t *testing.T) {
        result, _ := db.Exec("insert into user(name, age) value (?,?)", "hello", 123)
        lastInsertId, _ := result.LastInsertId()
        rowsAffected, _ := result.RowsAffected()
        fmt.Printf("result.lastInsertId: %d, result.rowsAffected: %d\n", lastInsertId, rowsAffected)
    })
    // READ
    t.Run("R", func(t *testing.T) {
        rows, _ := db.Query("select name, age from user") // 查询这里面必须要写上字段名
        for rows.Next() {
            var name string
            var age int
            rows.Scan(&name, &age)
            fmt.Printf("name: %s, age: %d\n", name, age)
        }
    })
    // UPDATE
    t.Run("U", func(t *testing.T) {
        result, _ := db.Exec("update user set age = 321 where name = ?", "hello")
        lastInsertId, _ := result.LastInsertId()
        rowsAffected, _ := result.RowsAffected()
        fmt.Printf("result.lastInsertId: %d, result.rowsAffected: %d\n", lastInsertId, rowsAffected)
    })
    // DELETE
    t.Run("D", func(t *testing.T) {
        result, _ := db.Exec("delete from user where name = ?", "hello")
        lastInsertId, _ := result.LastInsertId()
        rowsAffected, _ := result.RowsAffected()
        fmt.Printf("result.lastInsertId: %d, result.rowsAffected: %d\n", lastInsertId, rowsAffected)
    })
    // TRANSACTION
    t.Run("T", func(t *testing.T) {
        tx, err := db.Begin()
        if err != nil {
            log.Println("db.Begin() fail!")
            return
        }
        db.Exec("insert into user(name, age) value (?,?)", time.Now().String(), rand2.Intn(120-1)+1)
        err1 := tx.Commit()
        if err1 != nil {
            log.Println("tx.Commit() fail, tx rollback")
            err2 := tx.Rollback()
            if err2 != nil {
                log.Println("tx rollback fail...")
            }
        }
    })
}
```

原文链接: [https://tomoya92.github.io/2021/02/22/gin-tutorial-db/](https://tomoya92.github.io/2021/02/22/gin-tutorial-db/)

使用ORM框架来实现数据库的CRUD，这里选择的是GORM

安装

```
go get -u gorm.io/gorm
go get -u gorm.io/driver/mysql
```

创建db工具类

```go
package util

import (
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
    "log"
    "os"
    "time"
)

var DB *gorm.DB
var err error

func init() {
    newLogger := logger.New(
        log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
        logger.Config{
            SlowThreshold: time.Second, // 慢 SQL 阈值
            LogLevel:      logger.Info, // Info级别会打印sql
            Colorful:      false,       // 禁用彩色打印
        },
    )
    DB, err = gorm.Open(mysql.Open("root:123123@/gin-tutorial?loc=Local&collation=utf8mb4_unicode_ci"),
        &gorm.Config{
            Logger: newLogger,
        })
    if err != nil {
        panic("failed to connect database")
    }
    sqlDB, err := DB.DB()
    // 配置连接池
    if err == nil {
        // SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
        sqlDB.SetMaxIdleConns(10)
        // SetMaxOpenConns sets the maximum number of open connections to the database.
        sqlDB.SetMaxOpenConns(100)
        // SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
        sqlDB.SetConnMaxLifetime(time.Hour)
    }
}
```

CREATE

```go
var user = model.User{Name: 'xxx', Password: "123123", Age: 11}
insert into user (name, password, age) value('xxx', '123123', 11);
DB.Save(&user)
```

READ

```go
var user model.User
DB.Find(&user)
// select id, name, password, age from user;
fmt.Println(user)
```

UPDATE

```go
// 带条件更新多个字段，当条件不是Id时，可以改成其它字段，比如 .Where(model.User{Name: "abc"})
DB.Where(model.User{Id: 1}).Updates(model.User{Name: 'abc', Password: '123456', Age: 12})
// update user set name = 'abc', password = '123456', age = 12 where id = 1;
```

DELETE

```go
DB.Where(model.User{Id: 1}).Delete(&model.User{})
// delete from user where id = 1;
```

修改后的UserService

```go
package service

import (
    "gin-tutorial/model"
    . "gin-tutorial/util"
)

func GetUsers() []model.User {
    var users []model.User
    DB.Find(&users)
    return users
}

func GetByName(name string) model.User {
    var user model.User
    DB.Find(&user, model.User{Name: name})
    return user
}

func SaveUser(name string, password string, age int) model.User {
    var user = model.User{Name: name, Password: password, Age: age}
    DB.Save(&user)
    return user
}

func UpdateUserByName(name string, password string, age int) model.User {
    var user model.User
    DB.Where(model.User{Name: name}).Updates(model.User{Age: age, Password: password})
    DB.Find(&user, model.User{Name: name})
    return user
}

func DeleteUserByName(name string) {
    DB.Where(model.User{Name: name}).Delete(&model.User{})
}
```
