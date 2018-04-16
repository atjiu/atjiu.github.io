---
layout: post
title: 使用axios一次上传多张图片，自带上传进度
date: 2018-04-16 16:41:44
categories: javascript学习笔记
tags: axios
author: 朋也
---

* content
{:toc}

## 引入JS

国内就用 https://bootcdn.cn 上找一下axios的链接就可以了

## 用法

```html
<input type="file" multiple accept="image/jpeg,image/png," name="multipleFile" id="multipleFile"/>
```





//上传方法

```js

$(function() {
  $("#multipleFile").change(function(){
    var formData = new FormData();
    var files = this.files;
    for(var i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }
    axios.post('/upload', formData, {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: [function(data) {
        return data
      }],
      onUploadProgress: function(e) {
        var percentage = Math.round((e.loaded * 100) / e.total) || 0;
        if (percentage < 100) {
          console.log(percentage + '%');  // 上传进度
        }
      }
    }).then(function(resp) {
      console.log(resp.data); // {code: 200, description: "", detail: null}
    })
  })
})
```

// 接收方法

```java
@PostMapping("/upload")
@ResponseBody
public Result upload(@RequestParam("files[]") MultipartFile[] files) {
  if (files != null && files.length > 0) {
    List<String> list = new ArrayList<>();
    for (MultipartFile file : files) {
      if (!file.isEmpty()) {
        String saveDir = DateUtil.formatDateTime(new Date(), "yyyyMMdd");
        String requestPath = uploadFile(file, saveDir);
        list.add(requestPath);
      }
    }
    return Result.success(list);
  } else {
    return Result.error("请选择要上传的文件");
  }
}

public String uploadFile(MultipartFile file, String saveDir) {
  String suffix = "." + file.getContentType().split("/")[1];
  String fileName = UUID.randomUUID().toString() + suffix;
  // 判断要上传的文件夹是否存在，不存在则创建
  File localPathDir = new File(siteConfig.getUploadPath() + saveDir);
  if (!localPathDir.exists()) localPathDir.mkdirs();

  String localPath = siteConfig.getUploadPath() + saveDir + File.separator + fileName;
  String requestUrl = siteConfig.getStaticUrl() + saveDir + File.separator + fileName;

  // 上传文件
  try {
    @Cleanup BufferedOutputStream stream = new BufferedOutputStream(
        new FileOutputStream(new File(localPath))
    );
    stream.write(file.getBytes());
  } catch (IOException e) {
    e.printStackTrace();
    log.info("上传图片失败");
    return null;
  }

  return requestUrl;
}
```

## 兼容性

axios 兼容性：IE8+ 参见：https://github.com/axios/axios#browser-support

但FormData在IE11里才支持

所以这种方法的兼容性是IE11+，至于Chrome，Firefox都是支持的

兼容性查询可以访问：https://caniuse.com/

