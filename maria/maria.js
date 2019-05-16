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

function Maria(){
    this.init = function(app){
        app.post('/maria/register.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('insert into user (username , passwd , company) values(:username , :passwd , :company)' , query , function(rows , e){
                if(e){
                    res.send(e);
                }
                else{
                    res.send({code : 0});
                }
            });
        });
        app.post('/maria/login.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('select * from user where username = :username' , query , function(rows , e){
                var json = {
                    code : 0
                }
                if(rows.length == 0){
                    json.code = 1;
                }
                else if(rows[0].passwd != query.passwd){
                    json.code = 2;
                }
                else{
                    res.cookie('user' , btoa(encodeURIComponent(JSON.stringify(rows[0]))));
                }
                res.send(json);
            });
        });
        app.get('/maria/logout.json' , function(req , res){
            res.cookie('user' , '' , 0);
            res.send({code : 0});
        });
        app.get('/maria/get-config-list.json' , function(req , res){
            var dataBase = new DataBase();
            dataBase.query('select id , title , author , managers , users , gmt_time from data where status = 0' , req , function(rows , e){
                res.send({
                    code : 0 ,
                    data : rows
                });
            });
        });
        app.get('/maria/get-config-by-id.json' , function(req , res){
            var dataBase = new DataBase();
            dataBase.query('select * from data where status = 0 and id = :id ' , req.query , function(rows , e){
                if(rows.length == 1){
                    res.send({
                        code : 0 ,
                        data : rows[0]
                    })
                }
                else{
                    res.send({
                        code : 1 , 
                        msg : '未找到该配置'
                    })
                }
            });
        });
        app.post('/maria/insert-config.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var user = getUser(req);
            if(user.type > 1){
                res.send({
                    code : -11 ,
                    msg : '对不起，您没有权限添加配置'
                });
                return;
            }
            query.author = user.username;
            dataBase.query("insert into data (title , config , author , managers , users) values \
                (:title , :config , :author , :managers , :users)" , query , function(rows){
                res.send({
                    code : 0 ,
                    data : {id : rows.info.insertId}
                })
            })
        });

        app.post('/maria/update-config.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var user = getUser(req);
            if(user.type == 0 || user.username == query.author){
                dataBase.query('update data set title = :title , config = :config , managers = :managers , users = :users where id = :id' , query , function(rows){
                    res.send({
                        code : 0
                    })
                });
            }
            else{
                res.send({
                    code : -11 , 
                    msg : '对不起，您没有权限更新<span>' + query.title + '</span>的配置'
                });
                return;
            }
        });

        app.post('/maria/delete-config.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var user = getUser(req);
            if(user.type == 0 || user.username == query.author){
                dataBase.query('delete from data where id = :id' , query , function(rows){
                    res.send({
                        code : 0
                    })
                });
            }
            else{
                res.send({
                    code : -11 , 
                    msg : '对不起，您没有权限更新<span>' + query.title + '</span>的配置'
                });
                return;
            }
        });

        app.post('/maria/save-data.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var user = getUser(req);
            if(query.users.indexOf(user.username) == -1 && user.type > 0){
                res.send({
                    msg : "对不起，您没有权限更新id为：<span>" + query.id + "</span>的数据"
                })
            }
            else{
                dataBase.query('select id , version , version_author from data where id = :id' , query , function(rows , e){
                    if(rows.length == 0){
                        res.send({
                            msg : "没有找到<span>" + query.title + "</span>的数据"
                        })
                    }
                    else{
                        if(rows[0].version != query.version){
                            res.send({
                                msg : "版本错误，您当前版本为<span>v" + query.version + "</span>,系统已被<span>"+rows[0].version_author+"</span>更新为版本<span>v"+rows[0].version+"</span>，点击刷新，更新版本到系统版本。但您目前所编辑的数据<span>不再保存</span>"
                            })
                        }
                        else{
                            query.username = user.username;
                            dataBase.query('update data set data = :data , version_author = :username , version = version + 1 where id = :id' , query , function(rows , e){
                                res.send({
                                    code : 0
                                })
                            })
                        }
                    }
                })
            }
        });

        app.post('/maria/update-config-pics.json' , urlEncodedParser , function(req ,res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query("update data set pics = :pics where id = :id" , query , function(rows){
                res.send({
                    code : 0
                })
            })
        });

        app.get('/maria/get-data.json' , function(req , res){
            var dataBase = new DataBase();
            dataBase.query('select data from data where id = :id' , {id : req.query.id} , function(rows){
                if(rows.length == 0){
                    res.send('没有找到id：' + req.query.id + '的数据');
                }
                if(req.query.type == 'js'){
                    res.send('var json_' + req.query.id + ' = ' + rows[0].data);
                }
                else{
                    res.send(rows[0].data);
                }
            });
        });

        app.get('/maria/get-data-list.json' , function(req , res){
            var dataBase = new DataBase();
            dataBase.query('select id , data from data where id in ('+req.query.ids+')' , req.query , function(rows){
                var json = {};
                rows.map(function(item){
                    json['json_' + item.id] = JSON.parse(item.data);
                })
                if(req.query.type == 'js'){
                    res.send('var json_data = ' + JSON.stringify(json));
                }
                else{
                    res.send(json);
                }
            });
        })

        app.post('/maria/update-data-user.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var user = getUser(req);
            if(user.type == 0 || query.managers.indexOf(user.username) > -1){
                dataBase.query('update data set users = :users where id = :id' , query , function(rows){
                    res.send({
                        code : 0
                    })
                });
            }
            else{
                res.send({
                    code : -11 , 
                    msg : '对不起，您没有权限管理用户'
                });
                return;
            }
        });

        app.get('/maria/query-users.json' , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('select id , username , company ,  type , gmt_time from user' , query , function(rows){
                res.send({
                    code : 0 , 
                    data : rows
                })
            })
            
        });

        app.post('/maria/update-user.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var user = getUser(req);
            if(user.type == 0 ){
                dataBase.query('update user set type = :type where id = :id' , query , function(rows){
                    res.send({
                        code : 0
                    })
                });
            }
            else{
                res.send({
                    code : -11 , 
                    msg : '对不起，您没有权限管理用户'
                });
                return;
            }

        });

        app.post('/maria/save-active-data.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('select id from active where f1 = :f1 and f2 = :f2' , query , function(rows){
                if(rows.length == 0){
                    dataBase.query("insert into active (f1 , f2 , f3 , data , site) values(:f1 , :f2 , :f3 , :data , :site)" , query , function(rows , e){
                        if(e){
                            res.send(e);
                        }
                        else{
                            res.send(JSON.stringify({code : 0}));
                        }
                    })
                }
                else{
                    id = rows[0].id;
                    query.id = id;
                    dataBase.query("update active set data = :data where id= :id" , query , function(rows , e){
                        if(e){
                            res.send(e);
                        }
                        else{
                            res.send(JSON.stringify({code : 0}));
                        }
                    })
                }
            });
        });
        app.get('/maria/get-active-data.json' , function(req , res){
            var dataBase = new DataBase();
            dataBase.query('select * from active where site = :site and f1 = :f1' , req.query , function(rows){
                res.send(rows);
            });
        });
    }
}
module.exports = Maria;




