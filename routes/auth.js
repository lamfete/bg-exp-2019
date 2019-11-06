const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const crypto = require('crypto');

const app = express();

var router = express.Router();
var pool = require('../database');
var methods = {};

var prefix = "BakoelGame2019YangTerbaik";
var suffix = "Tahun2020BakoelGameMakinJayaNomer1";

// redis connection
redisClient.on('connect', function() {
    console.log('Redis client connected (auth.js)');
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// Cookie Parser
app.use(cookieParser("kunciRahasia#BakoelGame@2019"));

const cookieConfig = {
    httpOnly: true, // to disable accessing cookie via client side js
    //secure: true, // to force https (if you use it)
    maxAge: 1000*60, // ttl in ms (remove this option and cookie will die when browser is closed) 1000*60*60*24*7
    signed: true // if you use the secret with cookieParser
};// there is many other params you can find here https://www.npmjs.com/package/cookie#options-1


function generateTokenRedis(username, ip){
    return new Promise(function(resolve, reject){
        // var prefix = "sayaCintaSurabaya2019";
        // var suffix = "PersebayaSelaluDiHati1927";
        var keyword = prefix + username + ip + suffix;
        var token = crypto.createHash('sha1').update(keyword).digest("hex");
        if(token) {
            resolve(token);
        } else {
            reject(Error);
        }
    });
}

function generateTokenCookie(username, ip){
    return new Promise(function(resolve, reject){
        // var prefix = "BakoelGame2019YangTerbaik";
        // var suffix = "Tahun2020BakoelGameMakinJayaNomer1";
        var keyword = prefix + username + ip + suffix;
        var token = crypto.createHash('sha1').update(keyword).digest("hex");
        if(token) {
            resolve(token);
        } else {
            reject(Error);
        }
    });
}

function setSessionRedis(username, token){
    // session into redis
    return new Promise(function(resolve, reject){
        redisClient.set(token, username);
        redisClient.get(token, function(error, result){
            resolve(result);
        });
    });
}

function getUsernameFromSessionRedis(token){       
    return new Promise(function(resolve, reject){
        if(token === undefined){
            token = "abc";
        }
        
        redisClient.get(token, function(error, result){
            if(result) {
                resolve(result);
            } else {
                resolve("GUEST");
            }
        });
    });
}

function setCookie(req, res, token){
    // console.log(res.cookie("BGToken", token, cookieConfig));
    res.cookie("BGToken", token, cookieConfig);
    /*return new Promise(function(resolve, reject){        
        // Cookies
        res.cookie("BGToken", token, cookieConfig, function(result){
            // set to cookie as signedCookies
            console.log("TESSSSSSSSSSSSS");            
            console.log(req.signedCookies.BGToken);       
            console.log("++++++++++++++++++++++++++");
                 
            resolve(req.signedCookies.BGToken);
        });
    });*/
}

function getCookie(req){
    return new Promise(function(resolve, reject){
        var cookie = req.signedCookies.BGToken;
        if(cookie) {
            resolve(cookie);
        } else {
            // reject(Error);
            resolve(null);
        }
    });
}

function clearCookie(res){
    res.clearCookie("BGToken");
}

//guard
function requiresLogin(req, res, next) {    
    if (!req.signedCookies.BGToken) {
        err = new Error("Not authorized");
        next(err);
    }
    return next();
};

function setNewUser(data){
    return new Promise(function(resolve, reject){
        var query = pool.query(
            'INSERT INTO `users`(`nama_person`, `email`, `no_hp`, `tgl_lahir`, `jenis_kelamin`, `id_user_role`, `username`, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [data.regName, data.regEmail, data.regHp, data.regTglLahir, data.regKelamin, data.regUserRole, data.regUsername, data.regPassword]
        );
        
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

function isLoggedIn(cookie){
    // console.log("cekCookieToSession original: " + cookie);
    var result = {};

    if(cookie === undefined) { 
        result.status = "notLoggedIn"; 
    }
    else { 
        result.status = "loggedIn"; 

        var getUsername = getUsernameFromSessionRedis(cookie);

        result.username = getUsername
        .then(function(sessionValue){
            return sessionValue;
        })
        .catch(function(error){
            console.log(error);
        });
    }
    return result;
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

module.exports = {
    generateTokenRedis, 
    generateTokenCookie, 
    setSessionRedis,
    setCookie, 
    getCookie,
    isLoggedIn,
    getUsernameFromSessionRedis,
    setNewUser,
    initLogin,
    clearCookie,
    requiresLogin
};