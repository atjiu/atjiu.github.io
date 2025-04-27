---
layout: post
title: Selenium自动化发布话题，以及获取window.showModalDialog()弹窗对象(Python实现)
date: 2019-01-21 14:07:00
categories: Python学习笔记
tags: Python selenium
author: 朋也
---

* content
{:toc}

> 折腾了一下自动化测试，找到了阿里开源的一个 uirecorder ，可以自动录制测试过程，但自定义逻辑有些麻烦
>
> 然后发现这货是基于 selenium 实现的，于是就开始折腾起了 selenium，弄出了个小成果，记录一下并分享给有需要的人

老规矩，先上图

![](/assets/images/selenium-demo.mp4" controls="controls" autoplay="autoplay" style="width: 100%;"></video>





## 安装

```
pip install selenium
```

## 打开浏览器

先下载 chromedriver 下载地址：[http://chromedriver.chromium.org/](http://chromedriver.chromium.org/)

下载好后解压，创建一个文件夹，名为：`selenium-dmeo`你也可以命名成其它名字，将 chromedriver拷贝进去，然后创建一个py文件，我这里命名为 `main.py`

```py
from selenium import webdriver

if __name__ == "__main__":
    browser = webdriver.Chrome("./chromedriver")
    browser.set_window_size(1024, 768)

    browser.get('https://demo.yiiu.co/')

    browser.quit()
```

这样就可以打开一个浏览器，然后在浏览器里打开网址：https://demo.yiiu.co/

## 获取元素并触发点击事件

selenium里获取元素的方法有很多个，如下

![](/assets/images/QQ20190121-142259.png)

我这里主要使用两个方法 `find_element_by_id` `find_element_by_xpath`

为啥要用这两个方法呢？`find_element_by_id`不用说，可以根据id获取唯一的元素，很准确，至于`find_element_by_xpath`是因为chrome浏览器里在审查元素里可以`copy Xpath` 也很方便

原链文接：[https://atjiu.github.io/2019/01/21/python-selenium/](https://atjiu.github.io/2019/01/21/python-selenium/)

获取到元素肯定要点击了，点击方法也很好实现，如下

1. 首先导入库 `from selenium.webdriver.common.keys import Keys`
2. 通过 send_keys() 方法触发点击事件 `.send_keys(Keys.ENTER)`

```py
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

if __name__ == "__main__":
    browser = webdriver.Chrome("./chromedriver")
    browser.set_window_size(1024, 768)

    browser.get('https://demo.yiiu.co/')

    # 等待Body标签加载出来
    WebDriverWait(driver=browser, timeout=30, poll_frequency=0.5)\
        .until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    # 通过xpath路径获取到登录A标签然后点击
    browser.find_element_by_xpath('//*[@id="bs-example-navbar-collapse-1"]/ul[2]/li[2]/a')\
        .send_keys(Keys.ENTER)
    # 也可以直接调用click()方法触发点击事件，不过如果要发送键盘事件就要用到Keys对象了
    # browser.find_element_by_xpath('//*[@id="bs-example-navbar-collapse-1"]/ul[2]/li[2]/a').click()
```

获取到元素就可以取元素上的值了，比如一个A标签的文本和链接，如下

```py
topicAElement = browser.find_element_by_xpath('/html/body/div/div/div/div[1]/div/div[2]/div[1]/div[2]/div/a')
text = topicAElement.get_attribute('text') # 有的元素用这种方式获取不到内容，可以直接使用 .text 的方式来获取
href = topicAElement.get_attribute('href')
print(text, href)
browser.quit()

# 打印结果
# 第一篇话题 https://demo.yiiu.co/topic/51
```

如果要获取一段html文本，可以使用

```py
html = topicAElement.get_attribute('outerHTML')
```

获取到html文本后，就可以使用BeautifulSoup结合lxml来解析页面结构了，比如要获取一个列表内的数据，其实列表长的都差不多，获取最外层的html对象后，直接获取列表然后循环这个列表，一个一个取值就可以了，这时要是使用selenium里的 find_element_by_xxx 方法来获取的话，速度非常慢，慢的难心忍受，所以这里推荐直接拿html源码，用第三方库来解析，速度飞一样的快

## 操作form表单

上一步可以获取到元素的对象了，也可以获取到元素上的信息了，那怎么给元素设置值呢，比如往表单里设置自定义的值

还是使用 `.send_keys()` 方法，用法如下

```py
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

if __name__ == "__main__":
    browser = webdriver.Chrome("./chromedriver")
    browser.set_window_size(1024, 768)

    browser.get('https://demo.yiiu.co/')

    # 等待Body标签加载出来
    WebDriverWait(driver=browser, timeout=30, poll_frequency=0.5)\
        .until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    browser.find_element_by_xpath('//*[@id="bs-example-navbar-collapse-1"]/ul[2]/li[2]/a')\
        .send_keys(Keys.ENTER)
    time.sleep(.5)
    # 等待Body标签加载出来
    WebDriverWait(driver=browser, timeout=30, poll_frequency=0.5) \
        .until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    # 设置登录用户名
    browser.find_element_by_id('username').send_keys("atjiu")
    time.sleep(.5)
    # 设置登录密码
    browser.find_element_by_id('password').send_keys("aa123123")
    time.sleep(.5)
    # 点击登录按钮
    browser.find_element_by_id('login_btn').send_keys(Keys.ENTER)
    time.sleep(2)
    browser.quit()
```

## 等待页面加载

等待页面加载的方法网上有很多文章介绍，我觉得直接等待下一步要操作的元素加载出来后，就可以操作了，这个比较实用，下面就介绍一下这个用法

导入依赖

链原接文：[https://atjiu.github.io/2019/01/21/python-selenium/](https://atjiu.github.io/2019/01/21/python-selenium/)

```py
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
```

用法

```py
WebDriverWait(driver=browser, timeout=30, poll_frequency=0.5) \
        .until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
```

说明：

WebDriverWait() 方法的参数

- driver: 就是 `browser = webdriver.Chrome("./chromedriver")` 对象
- timeout 参数：等待最长时间,单位秒
- poll_frequency: 多次调用之间的间隔时间，默认就是0.5s

until() 方法参数里的`presence_of_element_located()`方法里的参数是一个元组，不要写错了，外面是有一层`()`的，元组里也有多种判断写法，可以通过TAG_NAME, XPATH, CSS_SELECTOR等判断

另外就是系统提供的time库用来在两种操作中间等待一下，比如上面填写登录用户名和密码之间就睡眠了0.5s，这样可以方便调试 `time.sleep(.5)`

## 鼠标点击事件

有些输入框，比如上面打开的网站里发布话题的内容输入框，用的就是 codemirror ，直接找到 textarea 的id填值是没有效果的，这时候鼠标操作就派上用场了

首先还是导入依赖 `from selenium.webdriver.common.action_chains import ActionChains`

用法如下

```py
# 内容输入框使用的是codeMirror，这里再使用简单的获取textarea的id然后sendKeys是不行的，所以这里使用了鼠标点击事件来输入数据
contentElement = browser.find_element_by_xpath('//*[@id="form"]/div[2]/div/div[6]')
# 链式调用，最后通过 `perform()` 方法来触发依次执行前面定义好的执行过程
ActionChains(driver=browser).click(contentElement).send_keys("hello world").perform()
```

## 获取 window.showModalDialog() 弹窗

这是个坑，selenium默认拿不到 `showModalDialog()` 打开的窗口对象，但可以拿到 `window.open()` 的弹窗，所以这里就要做一下特殊处理

在调用 `browser.get(url)` 之后，使用 browser 对象执行一下下面的这两句js

```py
browser.execute_script('''
    window._showModalDialog = window.showModalDialog;
    window.showModalDialog = window.open;
''')
```

然后后面就可以使用 `browser.switch_to.window(browser.window_handles[-1])` 来获取弹窗了

这里还有一些坑

1. 如果一个网站上有很多操作都用到了 `window.showModalDialog()` 弹窗，上面将页面的 `window` 对象的 `showModalDialog` 对象改成 `open` 对象，后面网站上再通过 `window.showModalDialog()` 打开弹窗的话，就会失效，这时就要把 `showModalDialog` 对象再设置回来，这也就是我上面为啥要先将 `window.showModalDialog` 附给一个新的对象(`window._showModalDialog`)的原因，当然这个对象名字可以随便写，只要不是js内置的一些对象就可以
2. 当使用 `window.showModalDialog` 打开一个窗口，在执行一些操作后，这个窗口关闭了，这时候还要再次调用 `browser.switch_to.window(browser.window_handles[-1])` 将当前操作的窗口切换过来，否则selenium默认测试环境直接是关闭了，不一会就退出程序了

## 扩展

通过 selenium 可以自定义对网站操作的动作，这利用空间的太大了，网站防爬也就更难了，项目上线之间也可以通过自己编写脚本跑一遍，防止一些错误出现

另外还可以结合数据库或者Excel等实现自动化发帖，爬取网站数据等操作，即使是JS渲染的网站也不怕了，是不是很爽

补充：如果业务有一些是不用动脑子的非常程式化的工作，也可以使用selenium来实现，可以大大提升工作效率