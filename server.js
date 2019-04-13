var express = require('express');
var cookieParser = require('cookie-parser');
   
var DataBase = require('./database');
var Teach = require('./teach/teach');
var Maria = require('./maria/maria');

var dataBase = new DataBase();
var app = express();
app.use(cookieParser());
(new Teach()).init(app);
(new Maria()).init(app);
var server = app.listen(8888, function () {
    console.log("启动服务器 http://127.0.0.1:8888")
});

