/**
 * Firebase 配置文件
 * 
 * 请替换下面的配置为您自己的Firebase项目配置信息
 * 您可以在Firebase控制台 -> 项目设置 -> 常规 -> 您的应用 -> Firebase SDK片段 下找到这些信息
 */
const firebaseConfig = {
    apiKey: "AIzaSyBmoIl2eT742KHncvWhgSIXfxjZvCeOEPg",
    authDomain: "poison-8aef7.firebaseapp.com",
    databaseURL: "https://poison-8aef7-default-rtdb.firebaseio.com",
    projectId: "poison-8aef7",
    storageBucket: "poison-8aef7.firebasestorage.app",
    messagingSenderId: "137370942868",
    appId: "1:137370942868:web:145536ff2c5773e10b6381",
    measurementId: "G-L3V8R7D3QK"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);

// 导出数据库引用对象
const database = firebase.database();
const auth = firebase.auth(); 