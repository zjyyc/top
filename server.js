// var http = require('http');
// // console.log(args);
// var server = http.createServer(function (request, response) {
//     // 发送 HTTP 头部 
//     // HTTP 状态值: 200 : OK
//     // 内容类型: text/plain
//     response.writeHead(200, {'Content-Type': 'text/plain'});
//     // 发送响应数据 "Hello World"
//     response.end('Hello World +1 \n' + new Date().getTime());
// });

// server.listen(8888);
// console.log('Server running at http://127.0.0.1:8888/');

var express = require('express');
var app = express();
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
})
var server = app.listen(8888, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("启动服务器 http://127.0.0.1:8888")
})

