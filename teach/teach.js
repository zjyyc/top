var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var btoa = require('btoa');
var atob = require('atob');
var DataBase = require('../database');

var getUser = function(req){
    try{
        var user = decodeURIComponent(atob(decodeURIComponent(req.cookies.user)));
        return JSON.parse(user);
    }
    catch(e){
        console.log(e);
        return null;
    }
}

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
                        res.cookie('user' , btoa(encodeURIComponent(JSON.stringify(rows[0]))));
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

        app.get('/teach/logout.json' , function(req , res){
            res.cookie('user' , '' );
            rs = {
                code : 0 
            }
            res.send(JSON.stringify(rs));
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
            // console.log(decodeURIComponent(Buffer.from(req.cookies.user , 'base64').toString()));
            var user = getUser(req);
            if(!user){
                res.send({code : -1001});
            }
            dataBase.query('select id , username , pic , passwd , class1 , data from student where id = :id' , user , function(rows){
                res.send({
                    code : 0 ,
                    data : rows[0].data
                });
            });
        });
        app.get('/teach/get-work-by-class.json' , function(req , res){
            var dataBase = new DataBase();
            var user = getUser(req);
            if(user.type > 0){
                res.send({
                    code : -11 ,
                    msg : '对不起，你没有该权限'
                })
            }
            else{
                dataBase.query('select id , username , pic  , class1 , data from student where class1 = :class1' , 
                    JSON.parse(req.query.data) , function(rows){
                        res.send({
                            code : 0 ,
                            data : rows
                        })
                });
            }
        });
        app.post('/teach/save-work.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var json = JSON.parse(req.body.data);
            dataBase.query('update student set data = :data where id = :id' , 
                json , function(){
                    res.send({
                        code : 0 
                    })
            });
        });


    }
}
module.exports = Teach;











