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
        app.get('/maria/get-data.json' , function(req , res){
            var dataBase = new DataBase();
            dataBase.query('select data from data where id = :id' , {id : req.query.id} , function(rows){
                res.send(rows[0].data);
            });
        })
        app.post('/maria/save-active-data.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('select id from active where f1 = :f1 and f2 = :f2' , query , function(rows){
                if(rows.length == 0){
                    dataBase.query("insert into active (f1 , f2 , f3 , data , site) values(:f1 , :f2 , :f3 , :data , :site)" , query , function(rows , e){
                        console.log(rows);
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
                        console.log(rows);
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




