---
layout: post
title: Java使用HttpUrlConnection下载网络文件
date: 2018-05-11 09:47:00
categories: java学习笔记
tags: 下载 http
author: 朋也
---

* content
{:toc}

## 单线程下载

### 读取文件长度

防止文件过大，建议用long接收

```java
HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
long contentLength = connection.getContentLength();
```




### 读取文件头信息

```java
Map<String, List<String>> headers = connection.getHeaderFields();
```

对应浏览器里的这部分信息

![image-20180511095647315](https://tomoya92.github.io/assets/image-20180511095647315.png)

### 拿到文件名

http下载文件，有时候是文件的链接地址，这样直接从url里拿就可以了，但有时候文件是通过服务器写出的，这时候就要从响应头信息里拿文件名了，还拿不到，就用UUID生成一个随机的文件名

```java
private String getFileName(String url) throws UnsupportedEncodingException {
  String fileName = url.substring(url.lastIndexOf("/") + 1);
  if (fileName.contains(".")) {
    String suffix = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (suffix.length() > 4 || suffix.contains("?")) {
      fileName = headers.get("Content-Disposition").get(0);
      if (fileName == null || !fileName.contains("filename")) {
        fileName = UUID.randomUUID().toString();
      } else {
        fileName = fileName.substring(fileName.lastIndexOf("filename") + 9);
      }
    }
  } else {
    fileName = headers.get("Content-Disposition").get(0);
    if (fileName == null || !fileName.contains("filename")) {
      fileName = UUID.randomUUID().toString();
    } else {
      fileName = fileName.substring(fileName.lastIndexOf("filename") + 9);
    }
  }
  fileName = URLDecoder.decode(fileName, "UTF-8");
  return fileName;
}
```

### 获取流，写入文件

标准IO文件操作写法

```java
// 创建本地文件
File file = new File(localPath + File.separator + getFileName(url));
if(!file.exists()) file.mkdirs();
FileOutputStream fos = new FileOutputStream(file);
// 拿到文件流
InputStream is = connection.getInputStream();
int len;
byte[] b = new byte[1024];
while((len = is.read(b)) != -1) {
  fos.write(b);
  fos.flush();
}
fos.close();
is.close();
connection.disconnect();
```

### 统计下载量

在while循环里垒加读取的流数量，启动一个线程来每秒计算下载百分比和下载速度

```java
private void countDownload() {
  while (getCurrentLength() < getContentLength()) {
    try {
      Thread.sleep(1000);
      BigDecimal bigDecimal = new BigDecimal((double) (getCurrentLength() * 100 / getContentLength()));
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      System.out.println("下载完成：" + bigDecimal.doubleValue() +
                           "% 当前下载速度：" + formatLength(getCurrentLength() - getPreLength()) +
                           "/s 当前下载: " + formatLength(getCurrentLength()) +
                           " 文件大小: " + formatLength(getContentLength()));
      setPreLength(getCurrentLength());
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
}

private String formatLength(long length) {
  if (length < 1024) {
    return length + "b";
  } else if (length > 1024 && length < 1024 * 1024) {
    BigDecimal bigDecimal = new BigDecimal((double) length / 1024);
    bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
    return bigDecimal.floatValue() + "kb";
  } else if (length > 1024 * 1024 && length < 1024 * 1024 * 1024) {
    BigDecimal bigDecimal = new BigDecimal((double) length / 1024 / 1024);
    bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
    return bigDecimal.floatValue() + "mb";
  } else {
    BigDecimal bigDecimal = new BigDecimal((double) length / 1024 / 1024 / 1024);
    bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
    return bigDecimal.floatValue() + "gb";
  }
}
```

### 调用方法

统计方法要放在download()方法里写入文件之前调用，下面是完整代码

```java
import java.io.*;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Created by tomoya at 5/10/18
 */
public class Download {

  private String userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36";
  private String cookie = null;
  private String url = "http://localhost:5000/%E5%A4%A9%E7%A9%BA%E4%B9%8B%E7%9C%BC.BD.720p.%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97%E5%B9%95.rmvb";
  // 文件总长度
  private long contentLength;
  // 当前下载长度
  private long currentLength;
  private long preLength;
  private Map<String, List<String>> headers;
  private String localPath = "/Users/h/Desktop/download/download";

  public long getContentLength() {
    return contentLength;
  }

  public void setContentLength(long contentLength) {
    this.contentLength = contentLength;
  }

  public long getCurrentLength() {
    return currentLength;
  }

  public void setCurrentLength(long currentLength) {
    this.currentLength = currentLength;
  }

  public long getPreLength() {
    return preLength;
  }

  public void setPreLength(long preLength) {
    this.preLength = preLength;
  }

  private void download() {
    try {
      HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
      connection.setRequestProperty("User-Agent", userAgent);
      if(cookie != null) connection.setRequestProperty("Cookie", cookie);
      if(connection.getResponseCode() == 302) {
        url = connection.getHeaderField("Location");
        connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestProperty("User-Agent", userAgent);
        if(cookie != null) connection.setRequestProperty("Cookie", cookie);
      }
      setContentLength(connection.getContentLength());
      headers = connection.getHeaderFields();
      // 创建本地文件
      File file = new File(localPath);
      if (!file.exists()) file.mkdirs();
      file = new File(localPath + File.separator + getFileName(url));
      FileOutputStream fos = new FileOutputStream(file);
      // 在写文件之前调用统计方法
      new Thread(this::countDownload).start();
      // 拿到文件流
      InputStream is = connection.getInputStream();
      int len;
      byte[] b = new byte[1024];
      while ((len = is.read(b)) != -1) {
        setCurrentLength(getCurrentLength() + len);
        fos.write(b);
        fos.flush();
      }
      fos.close();
      is.close();
      connection.disconnect();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void countDownload() {
    while (getCurrentLength() < getContentLength()) {
      try {
        Thread.sleep(1000);
        BigDecimal bigDecimal = new BigDecimal((double) (getCurrentLength() * 100 / getContentLength()));
        bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
        System.out.println("下载完成：" + bigDecimal.doubleValue() +
                           "% 当前下载速度：" + formatLength(getCurrentLength() - getPreLength()) +
                           "/s 当前下载: " + formatLength(getCurrentLength()) +
                           " 文件大小: " + formatLength(getContentLength()));
        setPreLength(getCurrentLength());
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  }

  private String formatLength(long length) {
    if (length < 1024) {
      return length + "b";
    } else if (length > 1024 && length < 1024 * 1024) {
      BigDecimal bigDecimal = new BigDecimal((double) length / 1024);
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      return bigDecimal.floatValue() + "kb";
    } else if (length > 1024 * 1024 && length < 1024 * 1024 * 1024) {
      BigDecimal bigDecimal = new BigDecimal((double) length / 1024 / 1024);
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      return bigDecimal.floatValue() + "mb";
    } else {
      BigDecimal bigDecimal = new BigDecimal((double) length / 1024 / 1024 / 1024);
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      return bigDecimal.floatValue() + "gb";
    }
  }

  private String getFileName(String url) throws UnsupportedEncodingException {
    String fileName = url.substring(url.lastIndexOf("/") + 1);
    if (fileName.contains(".")) {
      String suffix = fileName.substring(fileName.lastIndexOf(".") + 1);
      if (suffix.length() > 4 || suffix.contains("?")) {
        fileName = headers.get("Content-Disposition").get(0);
        if (fileName == null || !fileName.contains("filename")) {
          fileName = UUID.randomUUID().toString();
        } else {
          fileName = fileName.substring(fileName.lastIndexOf("filename") + 9);
        }
      }
    }
    fileName = URLDecoder.decode(fileName, "UTF-8");
    return fileName;
  }

  public static void main(String[] args) {
    Download download = new Download();
    new Thread(download::download).start();
  }
}
```

运行效果如下

![image-20180512202850185](https://tomoya92.github.io/assets/image-20180512202850185.png)

## 多线程下载

> 原理：首先请求一下文件链接，拿到文件大小，然后计算每个线程要下载的量，拉着创建线程，把要下载的量传给线程，在线程里通过设置请求的Range来只读取文件的一部分，然后通过RandomAccessFile来写入本地文件

```java
connection.setRequestProperty("Range", "bytes=" + startLength + "-" + endLength);
```

```java
// 创建随机存储文件
RandomAccessFile raf = new RandomAccessFile(file, "rw");
// 设置从startLength位置开始写入
raf.seek(startLength);
```

其它跟单线程一样，下面是完整代码

```java
import java.io.*;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Created by tomoya at 5/10/18
 */
public class MultiThreadDownload {

  private String userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36";
  private String cookie = null;
  private String url = "http://localhost:5000/%E5%A4%A9%E7%A9%BA%E4%B9%8B%E7%9C%BC.BD.720p.%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97%E5%B9%95.rmvb";
  // 文件总长度
  private long contentLength;
  // 当前下载长度
  private long currentLength;
  private long preLength;
  private Map<String, List<String>> headers;
  private String localPath = "/Users/h/Desktop/download/download";
  private int threadSize = 10;
  private int completeThread;

  public long getContentLength() {
    return contentLength;
  }

  public void setContentLength(long contentLength) {
    this.contentLength = contentLength;
  }

  public long getCurrentLength() {
    return currentLength;
  }

  public void setCurrentLength(long currentLength) {
    this.currentLength = currentLength;
  }

  public long getPreLength() {
    return preLength;
  }

  public void setPreLength(long preLength) {
    this.preLength = preLength;
  }

  public int getCompleteThread() {
    return completeThread;
  }

  public void setCompleteThread(int completeThread) {
    this.completeThread = completeThread;
  }

  public synchronized void countDownloadLength(int len) {
    setCurrentLength(getCurrentLength() + len);
  }

  private void download() {
    try {
      HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
      connection.setRequestProperty("User-Agent", userAgent);
      if (cookie != null) connection.setRequestProperty("Cookie", cookie);
      if (connection.getResponseCode() == 302) {
        url = connection.getHeaderField("Location");
        connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestProperty("User-Agent", userAgent);
        if (cookie != null) connection.setRequestProperty("Cookie", cookie);
      }
      if (connection.getResponseCode() == 200) {
        setContentLength(connection.getContentLength());
        headers = connection.getHeaderFields();
        File file = new File(localPath);
        if (!file.exists()) file.mkdirs();
        long singleThreadDownloadLength = getContentLength() / threadSize;
        // 统计下载数据
        new Thread(this::countDownload).start();
        for (int i = 0; i < threadSize; i++) {
          long startLength = i * singleThreadDownloadLength;
          long endLength = (i + 1) * singleThreadDownloadLength - 1;
          if (i == threadSize - 1) {
            endLength = getContentLength() - 1;
          }
          new ThreadDownload(this, localPath + File.separator + getFileName(url), startLength, endLength, (i + 1)).start();
        }
      } else {
        System.out.println("responseCode: " + connection.getResponseCode() + " responseMessage: " + connection.getResponseMessage());
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  // 下载线程
  class ThreadDownload extends Thread {

    private MultiThreadDownload main;
    private String filePath;
    private long startLength, endLength;
    private int threadId;

    public ThreadDownload(MultiThreadDownload main, String filePath, long startLength, long endLength, int threadId) {
      this.main = main;
      this.filePath = filePath;
      this.startLength = startLength;
      this.endLength = endLength;
      this.threadId = threadId;
    }

    @Override
    public void run() {
      try {
        HttpURLConnection connection = (HttpURLConnection) new URL(main.url).openConnection();
        connection.setRequestProperty("User-Agent", userAgent);
        if (cookie != null) connection.setRequestProperty("Cookie", cookie);
        connection.setRequestProperty("Range", "bytes=" + startLength + "-" + endLength);
        if (connection.getResponseCode() == 206) {
          File file = new File(filePath);
          // 创建随机存储文件
          RandomAccessFile raf = new RandomAccessFile(file, "rw");
          // 设置从startLength位置开始写入
          raf.seek(startLength);
          BufferedInputStream bis = new BufferedInputStream(connection.getInputStream());
          int len;
          byte[] b = new byte[1024];
          while ((len = bis.read(b)) != -1) {
            main.countDownloadLength(len);
            raf.write(b);
          }
          raf.close();
          bis.close();
          connection.disconnect();
          main.setCompleteThread(main.getCompleteThread() + 1);
          //                    System.out.println("线程" + threadId + "下载完成!");
        }
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }

  private void countDownload() {
    while (getCurrentLength() != getContentLength()) {
      try {
        Thread.sleep(1000);
        BigDecimal bigDecimal = new BigDecimal((double) (getCurrentLength() * 100 / getContentLength()));
        bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
        System.out.println("下载完成：" + bigDecimal.doubleValue() +
                           "% 当前下载速度：" + formatLength(getCurrentLength() - getPreLength()) +
                           "/s 当前下载: " + formatLength(getCurrentLength()) +
                           " 文件大小: " + formatLength(getContentLength()));
        setPreLength(getCurrentLength());
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  }

  private String formatLength(long length) {
    if (length < 1024) {
      return length + "b";
    } else if (length > 1024 && length < 1024 * 1024) {
      BigDecimal bigDecimal = new BigDecimal((double) length / 1024);
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      return bigDecimal.floatValue() + "kb";
    } else if (length > 1024 * 1024 && length < 1024 * 1024 * 1024) {
      BigDecimal bigDecimal = new BigDecimal((double) length / 1024 / 1024);
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      return bigDecimal.floatValue() + "mb";
    } else {
      BigDecimal bigDecimal = new BigDecimal((double) length / 1024 / 1024 / 1024);
      bigDecimal = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP);
      return bigDecimal.floatValue() + "gb";
    }
  }

  private String getFileName(String url) throws UnsupportedEncodingException {
    String fileName = url.substring(url.lastIndexOf("/") + 1);
    if (fileName.contains(".")) {
      String suffix = fileName.substring(fileName.lastIndexOf(".") + 1);
      if (suffix.length() > 4 || suffix.contains("?")) {
        fileName = headers.get("Content-Disposition").get(0);
        if (fileName == null || !fileName.contains("filename")) {
          fileName = UUID.randomUUID().toString();
        } else {
          fileName = fileName.substring(fileName.lastIndexOf("filename") + 9);
        }
      }
    } else {
      fileName = headers.get("Content-Disposition").get(0);
      if (fileName == null || !fileName.contains("filename")) {
        fileName = UUID.randomUUID().toString();
      } else {
        fileName = fileName.substring(fileName.lastIndexOf("filename") + 9);
      }
    }
    fileName = URLDecoder.decode(fileName, "UTF-8");
    return fileName;
  }

  public static void main(String[] args) {
    MultiThreadDownload download = new MultiThreadDownload();
    new Thread(download::download).start();
  }
}
```

下载效果

![image-20180512202719125](https://tomoya92.github.io/assets/image-20180512202719125.png)

## 总结

1. 可以下载http视频文件，下载好后，可以正常打开观看
2. 就在我折腾这个的时候，百度盘又更新了下载设置，现在用http方式下载百度盘必要要带上cookie，否则会报403错误，但还是很不爽，就算加上了cookie，能下载了，但文件下不完就停了
3. 下载exe, dmg, ios等文件，打不开
4. 没有做断点续传，后面弄利索了加上

## 参考

- [如何通过HttpURLConnection得到http 302的跳转地址](https://blog.csdn.net/yaerfeng/article/details/19031529)
- [Java下载文件获取真实文件名](http://leeldy.iteye.com/blog/1605713)
