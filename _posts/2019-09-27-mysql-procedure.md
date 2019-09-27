---
layout: post
title: MySQL存储过程学习总结
date: 2019-09-27 14:14:00
categories: java学习笔记
tags: mysql
author: 朋也
---

* content
{:toc}

了解一下mysql的存储过程用法，总结一下






## 变量声明赋值

关键字 `declare`

```sql
-- 定义一个name变量，类型为 varchar

declare name varchar(20);
```

赋值关键字 `set`

```sql
-- 定义一个name变量，类型为 varchar

declare name varchar(20);
set name = "tomcat";
```

## 存储过程创建

格式如下

```sql
DELIMITER //
create procedure my_first_procedure()
begin
	-- 这里是要编写的逻辑
end
//
```

比如上面定义的name，现在要赋值并查询出来

```sql
DELIMITER //
create procedure my_first_procedure()
begin
	declare name varchar(20);
	set name = "tomcat";
	select name;
end
//
```

先执行存储过程，让mysql将存储过程创建好

删除存储过程

```sql
drop procedure my_first_procedure;
```

然后再使用 `call` 关键字调用存储过程

```sql
call my_first_procedure();
```

再执行调用语句结果如下

![](/assets/QQ20190927-143109@2x.png)

## 逻辑循环

if语句格式

```sql
if (condition) then
  -- do something...
end if;
```

if else

```sql
if condition then
  -- do something...
else
  -- do something...
end if;
```

if elseif

```sql
if condition then
  -- do something...
elseif condition then
  -- do something...
else
  -- do something...
end if;
```

**注意end if后面的分号，以及每个条件中语句的分号结束**

case when

```sql
declare name varchar(20);
set name = "tomcat";
case name
  when "tomcat" then
    select "tomcat";
  when "jetty" then
    select "jetty";
end case;
```

while do循环

```sql
while condition do
  // do something...
end while;
```

例：

```sql
DELIMITER //
create procedure my_first_procedure()
begin
	declare age int;
	declare sum int;
	set age = 1;
	set sum = 0;
	while age < 100 do
		set sum = sum + age;
		set age = age + 1;
	end while;
	select sum;
end
//

-- 如果存储过程已经存在了，先删除再创建
drop procedure my_first_procedure;

call my_first_procedure();
```

repeat until

```sql
repeat
  // do something...
until condition
end repeat;
```

例子

```sql
DELIMITER //
create procedure my_first_procedure()
begin
	declare age int;
	declare sum int;
	set age = 1;
	set sum = 0;
	repeat
		set age = age + 1;
		set sum = sum + age;
	until age > 100
	end repeat;
	select sum;
end
//

drop procedure my_first_procedure;

call my_first_procedure();
```

loop 循环

结构

```sql
loopName:loop
  if condition then
    leave loopName;
  end if;
  // do something...
end loop;
```

例子

```sql
DELIMITER //
create procedure my_first_procedure()
begin
	declare age int;
	declare sum int;
	set age = 1;
	set sum = 0;
	loopName:loop
		if age > 100 then
			leave loopName;
		end if;
		set age = age + 1;
		set sum = sum + age;
	end loop;
	select sum;
end
//

drop procedure my_first_procedure;

call my_first_procedure();
```

## 传值

对存储过程传值

有两个关键字 `in` `out`

in 是往存储过程中传值，如下例子

```sql
drop procedure my_first_procedure;

DELIMITER //
create procedure my_first_procedure(in age int)
begin
	if age < 10 then
		select "children";
	else
		select "other";
	end if;
end
//

-- declare age int;
set @age = 11;
call my_first_procedure(@age);
```

**这里用declare关键字声明一个变量传到存储过程中会有问题，所以改用@声明变量**

out是在存储过程中处理的结果返回出来用的, 使用中要配合着 `into` 关键字使用

用法

```sql
drop procedure my_first_procedure;

DELIMITER //
create procedure my_first_procedure(in age int, out name varchar(20))
begin
	if age < 10 then
		select "children" into name;
	else
		select "other" into name;
	end if;
end
//

-- declare age int;
set @age = 11;
set @name = "";
call my_first_procedure(@age, @name);
select @name;
```
