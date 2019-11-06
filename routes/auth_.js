const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const crypto = require('crypto');

// let hash = crypto.createHash('md5').update('some_string').digest("hex");

const app = express();

var router = express.Router();
var pool = require('../database');
var methods = {};

// redis connection
redisClient.on('connect', function() {
    console.log('Redis client connected (auth.js)');
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// just define your wanted config
const cookieConfig = {
    httpOnly: true, // to disable accessing cookie via client side js
    //secure: true, // to force https (if you use it)
    maxAge: 1000*60, // ttl in ms (remove this option and cookie will die when browser is closed) 1000*60*60*24*7
    signed: true // if you use the secret with cookieParser
};// there is many other params you can find here https://www.npmjs.com/package/cookie#options-1

//guard
function isLoggedIn(req, res, next) {
    if (!req.signedCookies.BGToken) {
    //   err = new Error("Not Logged In");
    //   next(err);
        //initial cookie for the first time
        res.cookie('BGToken', 'notLoggedIn');
    }
    return next();
};

function initLogin(username, password) {
    var hasil = {};
    // init result as object Promise
    return new Promise(function(resolve, reject){
        // query from database
        var query = pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        // var query = pool.query('SELECT * FROM users WHERE username = "lilu" AND password = "123"');
        
        query.then(function(result){
            hasil = result;
            
            return hasil;
        }).catch(function(err){
            console.log(err);
        });

        // if success
        if(query){
            // return query as object
            // console.log(query);
            resolve(query);
        } else {
            // throw error
            reject(Error);
        }
    });
}

function login(username, password) {
    var loginPromise = initLogin(username, password);

    return new Promise(function(resolve, reject){
        loginPromise.then(function(result){        
            // convert result object into data object
            // queryResult = result;
            // console.log("queryResult");
            // console.log(result[0].username);
            // console.log("===========================");
            // console.log(queryResult);
            var dataLogin = {};
            dataLogin = {
                status: true,
                username: result[0].username,
                password: result[0].password,
                userRole: result[0],id_user_role
            }; 
            // console.log('dataLogin');
            // console.log(dataLogin);
            // console.log("===========================");
            console.log("MASUK SINI");
            console.log(dataLogin.username + " is logged in");
            
            return dataLogin;
        }).catch(function(error){
            data = {
                status: false
            };
            // console.log(data);
            return data;
        }).then(function(data){
            // console.log("DATA YG BIKIN ERROR")
            // console.log(data);
            // console.log("===============");
            if(data.status === true) {
                // hash password with md5
                var token = crypto.createHash('md5').update(data.password).digest("hex");

                data = {
                    token: token,
                    userRole: data.userRole
                };
                console.log('TOKEN: ' + data.token);
                return data;
            }
        }).catch(function(error){
            console.log(error);
        });
    });
}

router.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    // var queryResult = {};    
    
    var loginPromise = initLogin(username, password);

    loginPromise.then(function(result){        
        // convert result object into data object
        // queryResult = result;
        // console.log("queryResult");
        // console.log(result[0].username);
        // console.log("===========================");
        // console.log(queryResult);
        var dataLogin = {};
        dataLogin = {
            status: true,
            username: result[0].username,
            password: result[0].password,
            userRole: 5
        }; 
        // console.log('dataLogin');
        // console.log(dataLogin);
        // console.log("===========================");
        console.log("MASUK SINI");
        console.log(dataLogin.username + " is logged in");
        
        return dataLogin;
    }).catch(function(error){
        data = {
            status: false
        };
        // console.log(data);
        return data;
    }).then(function(data){
        // console.log("DATA YG BIKIN ERROR")
        // console.log(data);
        // console.log("===============");
        if(data.status === true) {
            // hash password with md5
            var token = crypto.createHash('md5').update(data.password).digest("hex");

            data = {
                token: token,
                userRole: data.userRole
            };
            console.log('TOKEN: ' + data.token);
            return data;
        }
    }).then(function(data){
        console.log("YANG BARU");
        console.log(data);
        console.log("========================================");
        // Cookies
        res.cookie("BGToken", data.token, cookieConfig);
        // set to cookie as signedCookies
        req.signedCookies.BGToken;

        const signedCookies = req.signedCookies.BGToken;
        console.log('signed-cookies:', signedCookies);  

        // session into redis
        redisClient.set(username, "loggedIn");
        var resp = redisClient.get(username);
        console.log("REDIS: " + resp);
        // console.log(data.userRole);
        // res.send(signedCookies);
        // res.redirect('/');

        var indexRouter = require('./front_office/index');
        var jenisProduk = indexRouter.initJenisProduk();
        var kategoriProduk = indexRouter.initKategoriProduk();

        jenisProduk.then(function(data){
            // console.log(data[0].id_jenis_produk + " | " + data[0].nama_jenis_produk);
            return data;
        }).catch(function(error){
            if(error) throw error;
        }).then(function(passJenisProduk){
            // nested promise
            // jenisProduk -> kategoriProduk
            kategoriProduk.then(function(data){
                return data;
            }).catch(function(error){
                if(error) throw error;
            }).then(function(passKatProduk){
                // diakhiri dengan render ke view index.ejs
                console.log(data.userRole);
                res.render('../views/front_office/index.ejs', {isLoggedIn: data.token, listJenisProduk: passJenisProduk, listKatProduk: passKatProduk, userRole: 5}); 
            });
        });
        // res.render('../views/front_office/index.ejs', {isLoggedIn: 'loggedIn'}/*, userRole: data.userRole}*/); 
    }).catch(function(error){
        console.log(error);
    });
});

module.exports = router;
module.exports.isLoggedIn = isLoggedIn;
module.exports.initLogin = initLogin;
module.exports.login = login;

/*router.post('/', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var queryResult = {};

    // var loginPromise = initLogin(username, password);

    var loginPromise = new Promise(function(resolve, reject) {
        var query = pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
      
        if (query) {
            // console.log(query);
            resolve(query);
        }
        else {
            reject(error);
        }
    });

    loginPromise.then(function(result) {
        // console.log(result); // "Stuff worked!"
        // res.redirect('/');
        return result;
    }.catch(function(err) {
        console.log(err); // Error: "It broke"
    });

    /*loginPromise.then(function(result){        
        // convert result object into data object
        queryResult = result;
        console.log(queryResult);

        dataLogin = {
            status: true,
            username: username,
            password: password
        }; 
        
        // console.log(dataLogin);
        console.log("MASUK SINI");
        console.log(dataLogin.username + " is logged in");
        
        return dataLogin;
    }).catch(function(error){
        data = {
            status: false
        };
        // console.log(data);
        return data;
    }).then(function(data){
        if(data.status === true) {
            // hash password with md5
            var token = crypto.createHash('md5').update(data.password).digest("hex");
            console.log('TOKEN: ' + token);
            return token;
        }
    }).then(function(token){
        // Cookies
        res.cookie("BGToken", token, cookieConfig);
        // set to cookie as signedCookies
        req.signedCookies.BGToken;

        const signedCookies = req.signedCookies.BGToken;
        console.log('signed-cookies:', signedCookies);  

        // session into redis
        redisClient.set(username, "loggedIn");
        var resp = redisClient.get(username);
        console.log("REDIS: " + resp);

        // res.send(signedCookies);
        res.redirect('/');
    }).catch(function(error){
        console.log(error);
    });
});*/