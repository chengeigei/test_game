# 女巫的毒药 - 在线版

这是一个基于Web的双人在线游戏，两个玩家分别在棋盘上秘密放置一个"毒药"，然后轮流点击格子，避开对方的毒药。踩到毒药的玩家将输掉游戏。

## 功能特点

- 创建或加入游戏房间
- 可自定义棋盘尺寸
- 实时多人对战
- 简单易用的界面

## 安装与设置

要让游戏完全运行，您需要创建一个Firebase项目，并将配置信息替换到项目中。

### 1. 创建Firebase项目

1. 前往 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称，例如"女巫的毒药"
4. 启用Google Analytics（可选）
5. 点击"创建项目"

### 2. 设置Realtime Database

1. 在Firebase控制台左侧菜单选择"构建" > "Realtime Database"
2. 点击"创建数据库"
3. 选择"测试模式"开始，将安全规则的到期时间设为30天
4. 点击"启用"

### 3. 注册您的Web应用

1. 在Firebase控制台，点击"概览"页面上的"Web"图标(</>)
2. 为您的应用命名，如"女巫的毒药Web"
3. 点击"注册应用"
4. 复制提供的配置对象(`firebaseConfig`)

### 4. 更新配置

打开项目中的 `firebase-config.js` 文件，将您复制的配置信息替换掉默认的占位符：

```js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    databaseURL: "YOUR_DATABASE_URL",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 5. 部署游戏

您可以选择以下任一方式部署游戏：

#### 方式一：使用Firebase Hosting（推荐）

1. 全局安装Firebase CLI：
   ```
   npm install -g firebase-tools
   ```

2. 登录到Firebase：
   ```
   firebase login
   ```

3. 初始化Firebase项目：
   ```
   firebase init
   ```
   - 选择"Hosting"
   - 选择您之前创建的项目
   - 将"public"目录设置为您的项目目录
   - 配置为单页应用：否

4. 部署您的网站：
   ```
   firebase deploy
   ```

5. 部署完成后，您将获得一个可访问的URL，类似于：https://your-project-name.web.app

#### 方式二：使用其他静态托管服务

您也可以使用Vercel、Netlify等服务部署您的游戏。只需将项目文件上传到这些平台即可。

## 游戏玩法

1. 第一位玩家创建游戏，设置棋盘大小，并获得一个游戏ID
2. 将游戏ID分享给朋友
3. 朋友输入ID加入游戏
4. 双方秘密选择各自的毒药位置
5. 两位玩家轮流点击格子，避开毒药
6. 踩中毒药的玩家输掉游戏

## 代码结构

- `index.html` - 游戏的HTML结构
- `style.css` - 游戏的样式表
- `script.js` - 游戏的JavaScript逻辑
- `firebase-config.js` - Firebase配置文件

## 注意事项

- 游戏使用Firebase的免费套餐，适合非商业用途
- 如果您的游戏变得非常受欢迎，可能需要升级到付费计划
- Firebase Realtime Database有流量和存储限制，请参考Firebase的价格页面 