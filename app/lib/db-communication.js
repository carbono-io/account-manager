'use strict';
var Sequelize = require('sequelize');

var DB = function(connect){
    this.username = 'root';
    this.password = '';
    this.host = 'localhost';
    this.db = 'carbono';
    this.instance = null;
    
    if(connect) {
        this.connect();
    }
    
}

DB.prototype.connect = function() {
    var sequelize = new Sequelize(this.db, this.username, this.password, {
      host: this.host,
      dialect: 'mysql',
    
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    });
    
    this.instance = sequelize;
    
    // Or you can simply use a connection uri
    // var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
}

DB.prototype.getInstance = function() {
    return this.instance;
}
