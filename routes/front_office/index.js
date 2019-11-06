const express = require('express');
const session = require('express-session');
const util = require('util');
const request = require('request');
const axios = require('axios');

var router = express.Router();
var pool = require('../../database');
var authRouter = require('../auth');

// just define your wanted config
const cookieConfig = {
    httpOnly: true, // to disable accessing cookie via client side js
    //secure: true, // to force https (if you use it)
    maxAge: 1000*60, // ttl in ms (remove this option and cookie will die when browser is closed) 1000*60*60*24*7
    signed: true // if you use the secret with cookieParser
};// there is many other params you can find here https://www.npmjs.com/package/cookie#options-1

var dataJenisProduk = [];
var dataKategoriProduk = [];
var data = {};
var cookie = '';
var jenisProduk = [];
var kategoriProduk = [];

/*function index(req, res) {
    getJenisKategoriProduk(getJenisProduk, getKategoriProduk, function(result){
        jenisProduk = result.jenisProduk;
        kategoriProduk = result.kategoriProduk;
        // console.log(result);
        // dbRead.end();
        // res.send(result);
        res.render('../views/front_office/index.ejs', {
            isLoggedIn: "token", 
            listJenisProduk: jenisProduk, 
            // listKatProduk: kategoriProduk, 
            userRole: 5
        });
    });
    
    res.render('../views/front_office/index.ejs', {
        isLoggedIn: token, 
        listJenisProduk: jenisProduk, 
        listKatProduk: kategoriProduk, 
        userRole: 5
    });

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
            res.render('../views/front_office/index.ejs', {
                isLoggedIn: token, 
                listJenisProduk: jenisProduk, 
                listKatProduk: katProduk, 
                userRole: 5
            }); 
        });
    });
}*/

/*function cookie(req, res, callback){
    callback = callback || function() {};

    cookie = getCookie(req, res, function(result){
        return result;
    });

    if(!cookie){
        setCookie(req, res, function(result){
            cookie = getCookie(req, res, function(result){
               return result; 
            });
            return;
        });
    }

    console.log(cookie);
    return callback(cookie);
}*/

function _getCookie(req, res, callback){
    callback = callback || function() {};

    signedCookies = req.signedCookies.BGToken;
    console.log('signed-cookies:', signedCookies);  
    return callback(signedCookies);
    // Cookies
    /*res.cookie("BGToken", "123", cookieConfig);
    // set to cookie as signedCookies
    req.signedCookies.BGToken;
    console.log(req.cookies.BGToken);
    
    return callback(req.cookies.BGToken);*/
}

function initJenisProduk(){
    // init result as object Promise
    return new Promise(function(resolve, reject){
        // query from database
        var query = pool.query('SELECT * FROM jenis_produk WHERE status = "aktif"');
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

function initKategoriProduk(){
    // init result as object Promise
    return new Promise(function(resolve, reject){
        // query from database
        var query = pool.query('SELECT * FROM kategori_produk WHERE status = "PUBLISHED" ORDER BY RAND() LIMIT 12');
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

function getJenisProduk(param1, callback){
    callback = callback || function() {};

    var q1 = 'SELECT * FROM jenis_produk WHERE status = "aktif"';

    // dbRead.connect();

    dbRead.query(q1, function(error, result) {
        if(error) {
            return callback(error);
        }

        if (result.length > 0) {
            // console.log(result);
            for(var i=0;i<result.length;i++){
                dataJenisProduk.push(result[i]);
            }
            return callback(dataJenisProduk);
        } else {
            response.send('Tidak ada data di Jenis Produk');
        }			
    });
}

// tidak dipakai
function getKategoriProduk(param1, callback){
    callback = callback || function() {};

    var q1 = 'SELECT * FROM kategori_produk WHERE status = "PUBLISHED" ORDER BY RAND() LIMIT 12';

    // dbRead.connect();

    dbRead.query(q1, function(error, result) {
        if(error) {
            return callback(error);
        }

        if (result.length > 0) {
            // console.log(result);
            for(var i=0;i<result.length;i++){
                dataKategoriProduk.push(result[i]);
            }
            return callback(dataKategoriProduk);
        } else {
            response.send('Tidak ada data di Kategori Produk');
        }
    });
}

// tidak dipakai
function getJenisKategoriProduk(jenisProduk, katProduk, callback){
    callback = callback || function() {};
    var dataJenisKategoriProduk = {};
    
    // getJenisProduk(null, function(result){
    jenisProduk(null, function(result){
        // console.log(result);
        // res.send("Hello, world!");
        dataJenisKategoriProduk.jenisProduk = dataJenisProduk;
        console.log(dataJenisKategoriProduk);
        return callback(dataJenisKategoriProduk);
    });

    // getKategoriProduk(null, function(result){
    /*katProduk(null, function(result){
        dataJenisKategoriProduk.kategoriProduk = dataKategoriProduk;
        // console.log(dataJenisKategoriProduk);
        
    });*/
}

function getAllData(req, res, jenisKatProduk, cookie, callback){
    callback = callback || function() {};

    jenisKatProduk(jenisProduk, katProduk, function(result){
        data.jenisKatProduk = dataJenisKategoriProduk;
    });

    /*cookie(req, function(result){
        // data.cookie = 
    });*/
}

/*router.get('/', authRouter.isLoggedIn, function(req, res) {
    var token = getCookie(req);
    var jenisProduk = getJenisProduk();
    var kategoriProduk = getKategoriProduk();
    
    res.render('../views/front_office/index.ejs', {isLoggedIn: token, listJenisProduk: JenisProduk, listKatProduk: KatProduk, userRole: 5}); 
    /*jenisProduk.then(function(data){
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
            res.render('../views/front_office/index.ejs', {isLoggedIn: token, listJenisProduk: passJenisProduk, listKatProduk: passKatProduk, userRole: 25}); 
        });
    });
});*/

var jenisProduk = [];
router.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    // var queryResult = {};    

    var loginPromise = authRouter.login(username, password);
    console.log(username + ' | ' + password);
    console.log(loginPromise);

    loginPromise.then(function(result){
        console.log("MUNCUL GAK SIH");

    }).catch(function(error){
        if(error) throw error;
    });
});

module.exports = {initJenisProduk, initKategoriProduk};