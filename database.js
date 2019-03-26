var serverConfig = require('./server-conf.js');
var Maria = require('mariasql');
function DataBase(){
    
    this.connection = new Maria(serverConfig.dataBaseConfig);
    this.query = function(sql , param , fn){
        
        this.connection.query(this.connection.prepare(sql)(param) , function(e , rows){
            if(e){
                console.log(e);
            }
            fn(rows , e);
        });
        this.connection.end();
        
    }
}
module.exports = DataBase;





