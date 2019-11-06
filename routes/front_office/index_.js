const express = require('express');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const util = require('util');

var router = express.Router();
var pool = require('../../database');

var authRouter = require('../auth');

var jenisProduk = [];

function initJenisProduk(){
    // init result as object Promise
    return new Promise(function(resolve, reject){
        // query from database
        /*var query = pool.query('SELECT * FROM jenis_produk', function(error, results, fields){
            if(error) console.log(error);
            console.log(results[0].id_jenis_produk);
            return results;
        });*/
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
        /*var query = pool.query('SELECT * FROM jenis_produk', function(error, results, fields){
            if(error) console.log(error);
            console.log(results[0].id_jenis_produk);
            return results;
        });*/
        var query = pool.query('SELECT * FROM kategori_produk WHERE status = "PUBLISHED"');
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

router.get('/', authRouter.isLoggedIn, function(req, res) {
    var token = req.cookies.BGToken;
    var jenisProduk = initJenisProduk();
    var kategoriProduk = initKategoriProduk();

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
            res.render('../views/front_office/index.ejs', {isLoggedIn: token, listJenisProduk: passJenisProduk, listKatProduk: passKatProduk, userRole: 25}); 
        });
    });
    
    // res.render('../views/front_office/index.ejs', {isLoggedIn: token, listJenisProduk: passJenisProduk});
    // console.log(req.cookies.BGToken);
});

router.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    // var queryResult = {};    

    var loginPromise = authRouter.login(username, password);
    console.log(username + ' | ' + password);

    loginPromise.then(function(result){
        console.log(result);
        res.send(result);
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
                return data;
                // res.render('../views/front_office/index.ejs', {isLoggedIn: data.token, listJenisProduk: passJenisProduk, listKatProduk: passKatProduk, userRole: 5}); 
            });
        });
        // res.render('../views/front_office/index.ejs', {isLoggedIn: 'loggedIn'}/*, userRole: data.userRole}); 
    }).catch(function(error){
        console.log(error);
    });
    /*loginPromise.then(function(result){        
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
        // res.render('../views/front_office/index.ejs', {isLoggedIn: 'loggedIn'}/*, userRole: data.userRole}); 
    }).catch(function(error){
        console.log(error);
    });*/
});

module.exports = router;
module.exports.initJenisProduk = initJenisProduk;
module.exports.initKategoriProduk = initKategoriProduk;

/*module.exports = {
    getHomePage: (req, res) => {
        console.log("req.body.username: " + req.body.username);
        sess = req.session;
        // console.log("DISINI: " + req.session.username);
        redisClient.del('isLoggedIn', function(err, response) {
            if (response == 1) {
                console.log("Session Deleted Successfully!");
            } else{
                console.log("Cannot delete previous session");
            }
         })
        console.log("SETELAH DI DELETE: " + redisClient.get('isLoggedIn'));
        redisClient.set('isLoggedIn', "false");
        console.log("SETELAH DI SET FALSE: " + redisClient.get('isLoggedIn'));
        sess.email = 'email@email.com';
        sess.username = req.body.username;
        // let query = "SELECT * FROM `players` ORDER BY id ASC"; // query database to get all the players
        let query = "SELECT * FROM users";
        // execute query
        dbWrite.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            console.log("Ini dari index.js awal" + redisClient.get('isLoggedIn'));
            res.render('../views/front_office/index.ejs', {
                title: 'Welcome to Socka | View Players',
                email: sess.email,
                username: sess.username,
                isLoggedIn: redisClient.get('isLoggedIn')
                // ,players: result
            });
            console.log("Ini dari index.js akhir" + redisClient.get('isLoggedIn'));
        });
    },
};*/