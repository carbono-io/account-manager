'use strict';

var ProfileUser = function(app) {
    this.app = app;
    this.path = 'http://localhost:7888/account-manager';
    return this;
};

// True for sucess and False for error
// May throw exceptions
ProfileUser.prototype.createUser = function(data){
    if (data.code && data.name && data.email && data.password) {
        var options = {
            uri: this.path + '/profiles',
            method: 'POST',
            json: {
            "apiVersion":"1.0",
            "id":"23123-123123123-12312",
            "data":
                {
                    "id": "1234",
                    "items": [{
                        "code" : data.code,
                        "name": data.name,
                        "email": data.email,
                        "password": data.password,
                        
                    }]
                    
                }
            }
        };
        
        this.app.request(options, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    return true;
                  } else {
                      return false;
                    //   console.log(err + '   -   ' + res.statusCode);
                  }
            })
    } else {
        throw 'Missing param';
    }
};

// userData for sucess and False for error
// May throw exceptions
ProfileUser.prototype.getProfile = function(data){
    if (data.code) {
        var options = {
            uri: this.path + '/profiles/' + data.code,
            method: 'GET',
        };
        
        this.app.request(options, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    try {
                        var jObj = JSON.parse(res.body);
                        jObj = JSON.parse(jObj);
                        var data = jObj.data.items[0].profile;
                        return data;
                    } catch (e) {
                        throw (e);
                    }
                    
                  } else {
                      return false;
                    //   console.log(err + '   -   ' + res.statusCode);
                  }
            })
    } else {
        throw 'Missing param';
    }
};

// True for sucess and False for error
// May throw exceptions
ProfileUser.prototype.login = function(data){
    if (data.email && data.password) {
        var options = {
            uri: this.path + '/login',
            method: 'POST',
            json: {
            "apiVersion":"1.0",
            "id":"23123-123123123-12312",
            "data":
                {
                    "id": "1234",
                    "items": [{
                        "email": data.email,
                        "password": data.password,
                    }]
                    
                }
            }
        };
        
        this.app.request(options, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    return true;
                } else {
                    return false;
                //   console.log(err + '   -   ' + res.statusCode);
                }
            })
    } else {
        throw 'Missing param';
    }
};

// UserData for sucess and False for error
// May throw exceptions
ProfileUser.prototype.userInfo = function(data){
    if (data.email) {
        var options = {
            uri: this.path + '/userInfo',
            method: 'POST',
            json: {
            "apiVersion":"1.0",
            "id":"23123-123123123-12312",
            "data":
                {
                    "id": "1234",
                    "items": [{
                        "email": data.email,
                    }]
                    
                }
            }
        };
        
        this.app.request(options, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    try {
                        var jObj = JSON.parse(res.body);
                        var data = jObj.data.items[0].profile;
                        return data;
                    } catch (e) {
                        throw (e);
                    }
                } else {
                    return false;
                //   console.log(err + '   -   ' + res.statusCode);
                }
            })
    } else {
        throw 'Missing param';
    }
};


module.exports = ProfileUser;