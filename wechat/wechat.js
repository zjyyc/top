//appID : wxdc250c15a6c3de04
//AppSecret : d35681f1bcdd2e710f72960a425b594b



var WXBizDataCrypt = require('./WXBizDataCrypt');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var btoa = require('btoa');
var atob = require('atob');
var DataBase = require('../database');
var request = require('request');

function Wechat(){
    this.init = function(app){
        
        app.post('/wechat/login.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            var appID = 'wx0de0ef618dbb56b7';
            var AppSecret = 'bfb1306072a968cc5b84c970d3cdedb2';
            var  options = {
    　　　　　　　method: 'get',
                url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appID + '&secret=' + AppSecret + '&js_code='+ query.code +'&grant_type=authorization_code',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            request(options, function (err, result, body) {
                var session_key = JSON.parse(body).session_key;
                console.log(session_key);
                console.log(query);
                var pc = new WXBizDataCrypt(appID, session_key);
                var data = pc.decryptData(query.encryptedData , query.iv);
                var tel = data.purePhoneNumber;
                dataBase.query('select * from job_student where tel = :tel' , {tel : tel} , function(rows){
                    if(rows.length == 0){
                        dataBase.query('insert into job_student (tel , name , class1 , pics) values (:tel , "" , "" , "")' , {tel : tel} , function(rows){
                            res.send({tel : tel , pics : ''});
                        })
                    }
                    else{
                        res.send(rows[0]);
                    }
                })
            });
        });

        app.post('/wechat/save-student.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('update job_student set name = :name , no = :no , class1 = :class1 , pics = :pics where tel = :tel' , query , function(rows){
                res.send({code : 0});
            })
        });

        app.post('/wechat/apply.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('insert into job_apply (tel , company_id , job_id ) values (:tel , :companyId , :jobId )' , query , function(rows){
                res.send({code : 0});
            })
        });

        app.get('/wechat/get-apply-list-by-tel.json' , function(req , res){
            var dataBase = new DataBase();
            var query = req.query;
            dataBase.query('select * from job_apply where tel = :tel order by gmt_time desc' , query , function(rows){
                res.send(rows);
            });
        });

        app.get('/wechat/get-apply-list-by-company.json' , function(req , res){
            var dataBase = new DataBase();
            var query = req.query;
            dataBase.query('select a.tel , a.name , a.class1 , a.pics , b.company_id , b.job_id , b.type , b.gmt_time from job_student as a INNER JOIN job_apply as b  where  a.tel = b.tel and b.company_id = :companyId  order by gmt_time desc' , query , function(rows){
                res.send(rows);
            });
        });
        app.post('/wechat/apply-op.json' , urlEncodedParser , function(req , res){
            var dataBase = new DataBase();
            var query = req.body;
            dataBase.query('select manager ,  type from job_apply where job_id = :jobId and tel = :tel' , query , function(rows){
                if(rows[0].type != 0){
                    res.send({
                        code : -1 ,
                        data : rows[0]
                    })
                }
                else{
                    dataBase.query('update job_apply set type = :type , manager = :manager where job_id = :jobId and tel = :tel' , query , function(rows){
                        res.send({
                            code : 0
                        })
                    });
                }
            })
        });

    }
}
module.exports = Wechat;
