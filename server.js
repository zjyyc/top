var express = require('express');
var cookieParser = require('cookie-parser');

var DataBase = require('./dataBase');
var Teach = require('./teach/teach');

var dataBase = new DataBase();
var app = express();
app.use(cookieParser());
(new Teach()).init(app);
app.get('/', function (req, res) {
    res.send('Hello World');
});
app.get('/get-class' , function(req, res){
    // 输出 JSON 格式
    var response = {
        "first_name": '哈哈',
        "last_name": '你好呀'
    };
    console.log(response);
    res.send(JSON.stringify(response));
});
var server = app.listen(8888, function () {
    console.log("启动服务器 http://127.0.0.1:8888")
});

