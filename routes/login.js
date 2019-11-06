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
var indexRouter = require('./front_office/index');
var pool = require('../database');
var methods = {};

// redis connection
/*redisClient.on('connect', function() {
    console.log('Redis client connected (login.js)');
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});*/

// just define your wanted config
const cookieConfig = {
    httpOnly: true, // to disable accessing cookie via client side js
    //secure: true, // to force https (if you use it)
    maxAge: 1000*60, // ttl in ms (remove this option and cookie will die when browser is closed) 1000*60*60*24*7
    signed: true // if you use the secret with cookieParser
};// there is many other params you can find here https://www.npmjs.com/package/cookie#options-1

function login(req, res, callback){
    res.send("login page");
}

function getUsernamePassword(req, res){
    var username = req.body.username;
    var password = req.body.password;

    var usernamePassword = {
        username: username,
        password: password
    }

    return usernamePassword;
}

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

function getQueryLoginResult(usernamePasswordObj){
    var usernamePassword = {};
    usernamePassword = usernamePasswordObj;

    var initLoginPromise = initLogin(usernamePasswordObj.username, usernamePasswordObj.password);

    return new Promise(function(resolve, reject){
        var result = initLoginPromise.then(function(result){        
            // convert result object into data object
            // queryResult = result;
            // console.log("queryResult");
            // console.log(result[0].username);
            // console.log("===========================");
            // console.log(queryResult);
            var queryResult = {};
            queryResult = {
                status: true,
                username: result[0].username,
                password: result[0].password,
                userRole: result[0].id_user_role
            }; 
            // console.log('dataLogin');
            // console.log(queryResult);
            // console.log("===========================");
            // console.log("MASUK SINI");
            // console.log(dataLogin.username + " is logged in");
            // resolve(queryResult);
            return queryResult;            
        }).catch(function(error){
            console.log(error);
        });

        // if success
        if(result){
            // return query as object
            // console.log(result);
            resolve(result);
        } else {
            // throw error
            reject(Error);
        }
    });
}

function generateToken(tokenMaterial){
    // hash password with md5
    var token = crypto.createHash('md5').update(tokenMaterial).digest("hex");
    return token;
}

/*function setCookie(req, res, token){
    // Cookies
    res.cookie("BGToken", token, cookieConfig);
    // console.log(token);
    
    // set to cookie as signedCookies
    req.signedCookies.BGToken;

    const signedCookies = req.signedCookies.BGToken;
    console.log('signed-cookies:', signedCookies); 
}*/

function setCookie(req, res, token){
    // Cookies
    res.cookie("BGToken", token, cookieConfig);
    // set to cookie as signedCookies
    req.signedCookies.BGToken;

    const signedCookies = req.signedCookies.BGToken;
    console.log('signed-cookies: ' + signedCookies);

    return signedCookies;
}

function jenisProduk(){
    var jenisProdukPromise = indexRouter.initJenisProduk();
    
    return new Promise(function(resolve, reject){
        jenisProdukPromise.then(function(result){
            resolve(result);
        }).catch(function(error){
            res.send(error);
        });
    });
}

function loginProceed(req, res){
    // object {"username":"kiku","password":"123"}
    var usernamePassword = getUsernamePassword(req, res);
    // var queryLogin = getQueryLoginResult(usernamePassword);
    var queryLoginPromise = getQueryLoginResult(usernamePassword);
    var jenisProdukPromise = indexRouter.initJenisProduk();
    
    var kategoriProduk = indexRouter.initKategoriProduk();

    return new Promise(function(resolve, reject){
        queryLoginPromise.then(function(result){
            // res.send(result);
            result.token = generateToken(result.password);
            result.cookie = setCookie(req, res, result.token);
            result.isLoggedIn = "loggedIn";

            // res.send(result);
            return result;
        }).catch(function(error){
            console.log(error);
        }).then(function(result){
            jenisProdukPromise.then(function(data){
                // console.log(data[0].id_jenis_produk + " | " + data[0].nama_jenis_produk);
                // return data;
                var jenisProdukArr = [];
                for(var i=0; i<data.length; i++){
                    jenisProdukArr.push(data[i]);
                }
                result.jenisProduk = jenisProdukArr;
                // console.log(jenisProdukArr[0]);
                return jenisProdukArr;
            }).catch(function(error){
                if(error) throw error;
            /*}).then(function(passJenisProduk){
                var jenisKatProduk = {};
                console.log(passJenisProduk);
                // nested promise
                // jenisProduk -> kategoriProduk
                var passKatProduk = kategoriProduk.then(function(data){
                    return data;
                }).catch(function(error){
                    if(error) throw error;
                });.then(function(passKatProduk){
                    // diakhiri dengan render ke view index.ejs
                    if(result.status === true){
                        /*res.render('../views/front_office/index.ejs', {
                            isLoggedIn: result.isLoggedIn, 
                            listJenisProduk: passJenisProduk, 
                            listKatProduk: passKatProduk, 
                            userRole: 5
                        });
                        console.log("MUNCUL DULU");
                    }
                });
                jenisKatProduk.kategoriProduk = passKatProduk;
                jenisKatProduk.jenisProduk = passJenisProduk;
                return jenisKatProduk;*/
            });
            // console.log(passJenisKatProduk);
            // result.jenisKatProduk = passJenisKatProduk;
            // console.log(result);
            // console.log(jenisProduk());
            // result.jenisProduk = jenisProduk();
            resolve(result);    
        });
    });
}

function _login(username, password) {
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
            // console.log("MASUK SINI");
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

router.post('/', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    console.log("HALO SEMUA");
    var dataLogin = login(username, password);

    res.send(dataLogin);
    // var queryResult = {};    

    /*var loginPromise = initLogin(username, password);

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
        // res.render('../views/front_office/index.ejs', {isLoggedIn: 'loggedIn', userRole: data.userRole}); 
    }).catch(function(error){
        console.log(error);
    });*/
});

module.exports = {loginProceed, initLogin};
// module.exports.isLoggedIn = isLoggedIn;
// module.exports.initLogin = initLogin;
// module.exports.login = login;