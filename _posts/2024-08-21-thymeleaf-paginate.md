---
layout: post
title: Thymeleaf+Bootstrap封装分页组件
date: 2024-08-21 13:52:34
categories: 杂项
tags: thymeleaf bootstrap
author: 朋也
---

* content
{:toc}







## 效果

![](/assets/images/1745312373250.png)

![](/assets/images/1745312378083.png)

![](/assets/images/1745312381962.png)

![](/assets/images/1745312389028.png)

![](/assets/images/1745312394233.png)

![](/assets/images/1745312398468.png)

![](/assets/images/1745312403579.png)

![](/assets/images/1745312407898.png)

![](/assets/images/1745312413133.png)

![](/assets/images/1745312417026.png)

![](/assets/images/1745312420860.png)

## 代码

`templates/components/pagination.html`

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<body>
<div class="d-flex justify-content-between align-items-center mb-3" th:fragment="pagination(current,pageSize,rows,path)">
    <th:block th:with="pages = ${rows%pageSize==0?rows/pageSize:rows/pageSize+1}">
        <div>共 <span th:text="${pages}"/> 页 <span th:text="${rows}"/> 条数据</div>
        <div>
            <!--有数据：总页数大于1-->
            <th:block th:if="${pages >= 1}">
                <ul class="col pagination mb-0">
                    <li class="page-item" th:classappend="${current == 1} ? 'disabled'">
                        <a class="page-link" th:href="@{${path}(pageNo=${current - 1})}" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>

                    <!--总页数小于8-->
                    <th:block th:if="${pages < 8}" th:each="page:${#numbers.sequence(1,pages)}">
                        <li th:class="${page == current ? 'page-item active':'page-item'}">
                            <a class="page-link" th:href="@{${path}(pageNo=${page})}" th:text="${page}" th:title="|第${page}页|"></a>
                        </li>
                    </th:block>
                    <!--总页数大于等于8-->
                    <th:block th:if="${pages >= 8}">
                        <!--当前页小于5-->
                        <th:block th:if="${current < 5}">
                            <!--前4页-->
                            <th:block th:each="page:${#numbers.sequence(1,4)}">
                                <li th:class="${page == current ? 'page-item active':'page-item'}">
                                    <a class="page-link" th:href="@{${path}(pageNo=${page})}" th:text="${page}" th:title="|第${page}页|"></a>
                                </li>
                            </th:block>
                            <!--5、6页-->
                            <li class="page-item">
                                <a class="page-link" th:href="@{${path}(pageNo=5)}" title="第5页">5</a>
                            </li>
                            <li class="page-item">
                                <a class="page-link" th:href="@{${path}(pageNo=6)}" title="第6页">6</a>
                            </li>
                            <!--分隔符-->
                            <li class="page-item mx-2" disabled="">...</li>
                            <!--最后页-->
                            <li class="page-item">
                                <a class="page-link" th:href="@{${path}(pageNo=${pages})}" th:text="${pages}" th:title="|第${pages}页|"></a>
                            </li>
                        </th:block>
                        <!--当前页大于等于5-->
                        <th:block th:if="${current >= 5}">
                            <!--当前页小于等于倒数第5-->
                            <th:block th:if="${current <= pages - 5}">
                                <!--第1页-->
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=1)}" title="第1页">1</a>
                                </li>
                                <!--分隔符-->
                                <li class="page-item mx-2" disabled="">...</li>
                                <!--中间5页-->
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=${current - 2})}" th:text="${current - 2}" th:title="|第${current - 2}页|"></a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=${current - 1})}" th:text="${current - 1}" th:title="|第${current - 1}页|"></a>
                                </li>
                                <li class="page-item active">
                                    <a class="page-link" th:href="@{${path}(pageNo=${current})}" th:text="${current}" th:title="|第${current}页|"></a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=${current + 1})}" th:text="${current + 1}" th:title="|第${current + 1}页|"></a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=${current + 2})}" th:text="${current + 2}" th:title="|第${current + 2}页|"></a>
                                </li>
                                <!--分隔符-->
                                <li class="page-item mx-2" disabled="">...</li>
                                <!--最后页-->
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=${pages})}" th:text="${pages}" th:title="|第${pages}页|"></a>
                                </li>
                            </th:block>
                            <!--当前页大于倒数第5-->
                            <th:block th:if="${current > pages - 5}">
                                <!--第1页-->
                                <li class="page-item">
                                    <a class="page-link" th:href="@{${path}(pageNo=1)}" title="第1页">1</a>
                                </li>
                                <!--分隔符-->
                                <li class="page-item mx-2" disabled="">...</li>
                                <!--后6页-->
                                <th:block th:each="page:${#numbers.sequence(pages - 5,pages)}">
                                    <li th:class="${page == current ? 'page-item active':'page-item'}">
                                        <a class="page-link" th:href="@{${path}(pageNo=${page})}" th:text="${page}" th:title="|第${page}页|"></a>
                                    </li>
                                </th:block>
                            </th:block>
                        </th:block>
                    </th:block>
                    <li class="page-item" th:classappend="${current == pages} ? 'disabled'">
                        <a class="page-link" th:href="@{${path}(pageNo=${current + 1})}" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </th:block>
        </div>
    </th:block>
</div>
</body>
</html>
```

## 使用

```html
<div th:replace="~{components/pagination::pagination(${page.current}, ${page.size}, ${page.total}, @{/admin/user/list(name=${name},email=${email},inTime1=${inTime1},inTime2=${inTime2})})}"></div>
```



