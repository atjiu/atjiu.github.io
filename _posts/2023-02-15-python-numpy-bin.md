---
layout: post
title: Python numpy 数组降维，二进制转十进制
date: 2023-02-15 13:52:00
categories: Python学习笔记
tags: numpy 进制转换
author: 朋也
---

* content
{:toc}





## 数组降维

```py
import numpy as np

if __name__ == "__main__":
    a = np.random.random((3,2))
    print(a)
```

输出

```
[[0.54229277 0.25530353]
 [0.62046772 0.93534806]
 [0.09009871 0.24393533]]
```

将这些数据拉成一维的

```py
import numpy as np

if __name__ == "__main__":
    a = np.random.random((3,2))
    print(a)

    b = a.flatten()
    print(b)
```

输出

```
[[0.05725286 0.34705084]
 [0.8474222  0.09189953]
 [0.40950083 0.34640273]]
[0.05725286 0.34705084 0.8474222  0.09189953 0.40950083 0.34640273]
```

## 进制转换

构建一个一维数组，元素只有1，0

```py
import numpy as np

if __name__ == "__main__":
    a = [1,0,1,1,1,0]
    b = np.asarray(a)
    print(type(a), a)
    print(type(b), b)
```

输出

```
<class 'list'> [1, 0, 1, 1, 1, 0]
<class 'numpy.ndarray'> [1 0 1 1 1 0]
```

**将这个一维数组里的所有元素合并到一起并转成十进制数**

```py
import numpy as np

def bin2dec(x):
    return x.dot(2**np.arange(x.size)[::-1])

if __name__ == "__main__":
    a = bin2dec([1,0,1,1,1,0])
    print("a=", a)
```

输出

```
a= 46
```

**将十进制数转成二进制数**

```py
import numpy as np

"""
x: 十进制数。
bits: 补位数
"""
def dec2bin(x, bits):
    return np.array([int(i) for i in bin(x)[2:].zfill(bits)])

def bin2dec(x):
    return x.dot(2**np.arange(x.size)[::-1])

if __name__ == "__main__":
    a = dec2bin(46,0)
    print("a=", a)
    b = bin2dec(a)
    print("b=", b)
```

输出

```
a= [1 0 1 1 1 0]
b= 46
```
