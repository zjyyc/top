var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var DataBase = require('../dataBase');
function Teach(){
    this.init = function(app){
        app.get('/teach/login.json' , function(req , res){
            var dataBase = new DataBase();
            var query = JSON.parse(req.query.data);
            dataBase.query("select id , username , passwd , pic ,  class1 , type  from student where id = :id" , query , function(rows){
                var rs = {};
                if(rows.length == 0){
                    rs = {
                        code : 1 ,
                        msg : '学号'+query.id+'不存在'
                    }
                }
                else{
                    if(rows[0].passwd == query.passwd){
                        res.cookie('user' , Buffer.from(encodeURIComponent(JSON.stringify(rows[0]))).toString('base64'));
                        rs = {
                            code : 0 , 
                            data : rows[0]
                        }
                    }
                    else{
                        rs = {
                            code : 2 ,
                            msg : '登陆失败，密码错误'
                        }
                    }
                }
                res.send(JSON.stringify(rs));
            })
        });
        app.post('/teach/register.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = JSON.parse(req.body.data);
            dataBase.query("insert into student (id , username , passwd , class1) values(:id , :username , :passwd , :class1)" , query , function(rows , e){
                if(e){
                    res.send(e);
                }
                else{
                    res.send(JSON.stringify({code : 0}));
                }
                
            })
        });

        app.get('/teach/get-my-work.json' , function(req , res){
            var dataBase = new DataBase();
            console.log(decodeURIComponent(Buffer.from(req.cookies.user , 'base64').toString()));
            res.send('haha');
            // var user = req.cookies;
            // dataBase.query('select id , username , pic , passwd , class1 , data from student where id = :id' , query , function(rows){
            //     res.send(JSON.stringify(rows));
            // });
        });
    }
}
module.exports = Teach;