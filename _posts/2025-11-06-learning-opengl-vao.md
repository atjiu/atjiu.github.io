---
layout: post
title: OpenGL学习 - VAO
date: 2025-11-06 09:47:23
categories: OpenGL学习
tags: OpenGL
author: 朋也
---

* content
{:toc}







## 前言

在设置windowHint时，如果使用 `glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);` `GLFW_OPENGL_CORE_PROFILE` 使用这个属性时，就必须要用VAO。

下面来学习一下VAO

## VAO 示例代码

```cpp
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>

// 顶点数据 - 一个简单的三角形
float vertices[] = {
    // 位置              // 颜色
    -0.5f, -0.5f, 0.0f,  1.0f, 0.0f, 0.0f,  // 左下 - 红色
     0.5f, -0.5f, 0.0f,  0.0f, 1.0f, 0.0f,  // 右下 - 绿色
     0.0f,  0.5f, 0.0f,  0.0f, 0.0f, 1.0f   // 顶部 - 蓝色
};

// 着色器源码
const char* vertexShaderSource = R"(
#version 330 core
layout (location = 0) in vec3 aPos;      // 位置属性，location 0
layout (location = 1) in vec3 aColor;    // 颜色属性，location 1

out vec3 ourColor;  // 向片段着色器输出颜色

void main()
{
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor;  // 直接传递颜色
}
)";

const char* fragmentShaderSource = R"(
#version 330 core
out vec4 FragColor;
in vec3 ourColor;  // 从顶点着色器输入的颜色

void main()
{
    FragColor = vec4(ourColor, 1.0);  // 使用插值后的颜色
}
)";

int main()
{
    // 初始化 GLFW 和创建窗口
    glfwInit();
    GLFWwindow* window = glfwCreateWindow(800, 600, "VAO Example", NULL, NULL);
    glfwMakeContextCurrent(window);
    glewInit();

    // 编译着色器
    unsigned int vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
    glCompileShader(vertexShader);

    unsigned int fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
    glCompileShader(fragmentShader);

    // 创建着色器程序
    unsigned int shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);

    // 删除着色器对象（已经链接到程序中了）
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    // ==================== VAO 核心部分开始 ====================

    // 1. 生成 VAO、VBO
    unsigned int VAO, VBO;
    glGenVertexArrays(1, &VAO);  // 生成一个 VAO
    glGenBuffers(1, &VBO);       // 生成一个 VBO

    // 2. 绑定 VAO - 开始记录状态
    glBindVertexArray(VAO);

    // 3. 绑定并设置 VBO
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // 4. 配置顶点属性 - 这些配置会被 VAO 记住

    // 位置属性 (location = 0)
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // 颜色属性 (location = 1)
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    // 5. 解绑 VAO（可选，但推荐）
    glBindVertexArray(0);

    // ==================== VAO 核心部分结束 ====================

    // 渲染循环
    while (!glfwWindowShouldClose(window))
    {
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        // 使用着色器程序
        glUseProgram(shaderProgram);

        // 绑定 VAO - 这一行代码就恢复了所有顶点属性状态！
        glBindVertexArray(VAO);

        // 绘制三角形 - 现在不需要再设置任何顶点属性了
        glDrawArrays(GL_TRIANGLES, 0, 3);

        // 交换缓冲区和检查事件
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // 清理资源
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteProgram(shaderProgram);

    glfwTerminate();
    return 0;
}
```

## VAO 的逻辑详解

### 什么是 VAO？

VAO (Vertex Array Object) 是一个**状态容器**，它存储了：
- 顶点缓冲区的绑定
- 顶点属性的配置
- 启用/禁用的顶点属性数组

### VAO 的工作流程

**1. 创建阶段（设置状态）**
```cpp
glBindVertexArray(VAO);        // 开始记录状态
// 所有后续的顶点相关操作都会被 VAO 记录：
glBindBuffer(...);            // VBO 绑定状态
glVertexAttribPointer(...);   // 顶点属性配置
glEnableVertexAttribArray(...);// 启用属性
glBindVertexArray(0);         // 停止记录
```

**2. 渲染阶段（使用状态）**
```cpp
glBindVertexArray(VAO);  // 一键恢复所有记录的顶点状态
glDrawArrays(...);       // 绘制，使用 VAO 中存储的配置
```

### 顶点数据布局分析

```
顶点数据内存布局：
[位置X, 位置Y, 位置Z, 颜色R, 颜色G, 颜色B]
  |         |         |         |         |
  0-11字节  12-23字节 24-35字节 36-47字节 48-59字节

步长 (stride) = 6 * sizeof(float) = 24字节
```

注意：顶点数据不止上面这些，顶点是个大对象，（位置，颜色，材质，法线等等）这些东西的集合被称为顶点。上面安全中仅用到了位置坐标和颜色

### VAO 的优势

**没有 VAO 的旧方式：**
```cpp
// 每次绘制都要重新设置
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glVertexAttribPointer(0, 3, ...);
glEnableVertexAttribArray(0);
glVertexAttribPointer(1, 3, ...);
glEnableVertexAttribArray(1);
glDrawArrays(...);
```

**使用 VAO 的新方式：**
```cpp
// 只需绑定 VAO
glBindVertexArray(VAO);  // 一行代码恢复所有状态！
glDrawArrays(...);
```

### 多 VAO 示例

```cpp
// 创建两个不同的 VAO 用于不同物体
unsigned int VAO1, VAO2;
float triangle1[] = { /* 三角形1数据 */ };
float triangle2[] = { /* 三角形2数据 */ };

// 设置 VAO1
glGenVertexArrays(1, &VAO1);
glBindVertexArray(VAO1);
glBindBuffer(GL_ARRAY_BUFFER, VBO1);
glBufferData(GL_ARRAY_BUFFER, sizeof(triangle1), triangle1, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

// 设置 VAO2
glGenVertexArrays(1, &VAO2);
glBindVertexArray(VAO2);
glBindBuffer(GL_ARRAY_BUFFER, VBO2);
glBufferData(GL_ARRAY_BUFFER, sizeof(triangle2), triangle2, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(0);
glEnableVertexAttribArray(1);

// 渲染时轻松切换
glBindVertexArray(VAO1);
glDrawArrays(GL_TRIANGLES, 0, 3);  // 绘制三角形1

glBindVertexArray(VAO2);
glDrawArrays(GL_TRIANGLES, 0, 3);  // 绘制三角形2
```

## 关键要点总结

1. **VAO 是状态记录器**：它在设置阶段记录所有顶点相关的状态
2. **一次性设置**：顶点属性配置只需在初始化时设置一次
3. **高效渲染**：渲染时只需绑定 VAO，无需重复配置
4. **支持多个对象**：可以为每个网格创建不同的 VAO
5. **现代 OpenGL 要求**：核心模式必须使用 VAO

VAO 大大简化了渲染代码，使得管理复杂场景中的多个网格变得更加容易和高效。

