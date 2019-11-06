const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const crypto = require('crypto');
const util = require('util');
const request = require('request');

const app = express();

var router = express.Router();
var pool = require('../../database');
var authRouter = require('../auth');
var methods = {};

// var authRouter = require('../auth');

router.get('/', function(req, res) {
    // var token = req.cookies.BGToken;
    // res.render('../views/front_office/register.ejs', {isLoggedIn: token});

    res.render('../views/front_office/register.ejs');
});

router.post('/', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var noHp = req.body.no_hp;
    var tglLahir = req.body.dob;
    var kelamin = req.body.gender;
    var userRole = 5;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirmation = req.body.password_confirmation;

    /*var registerData = {
        regName: name,
        regEmail: email,
        regHp: noHp,
        regTglLahir: tglLahir,
        regKelamin: kelamin,
        regUsername: username,
        regPassword: password,
        regPasswordConfirmation: passwordConfirmation
    };*/

    var query = pool.query(
        'INSERT INTO `users`(`nama_person`, `email`, `no_hp`, `tgl_lahir`, `jenis_kelamin`, `id_user_role`, `username`, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [name, email, noHp, tglLahir, kelamin, userRole, username, password]
    );

    query.then(function(result){
        return new Promise(function(resolve, reject){
            let options = {
                url: 'http://192.110.110.72:5000/auth',
                form: {
                    username: req.body.username,
                    password: req.body.password
                }
            };
            
            request.post(options, function(error, response, body){
                // console.log("HALO");
                if(error) {
                    reject(error)
                } else {
                    console.log("REGISTRASI BERHASIL DAN LOGGED IN");
                    // console.log(JSON.parse(body));
                    // res.send(JSON.parse(body));
                    // resolve(body);
                    res.redirect('/');
                }
            });
        });
    })/*.catch(function(error){
        console.log(error);
    }).then(function(result){
        console.log(result);
        res.redirect('/');
    })*/;

    /*return new Promise(function(resolve, reject){
        let options = {
            url: 'http://192.110.110.72:5000/auth',
            form: {
                username: req.body.username,
                password: req.body.password
            }
        };
        
        request.post(options, function(error, response, body){
            // console.log("HALO");
            if(error) {
                reject (error)
            } else {
                console.log("REGISTRASI BERHASIL DAN LOGGED IN");
                res.redirect('/');
                // res.send(JSON.parse(body));
            }
        });
    });*/

    /*var promise = new Promise(function(resolve, reject) {
        // do a thing, possibly async, then...
        
        var name = req.body.name;
        var email = req.body.email;
        var noHp = req.body.no_hp;
        var tglLahir = req.body.dob;
        var kelamin = req.body.gender;
        var username = req.body.username;
        var password = req.body.password;
        var passwordConfirmation = req.body.password_confirmation;

        var registerData = {
            regName: name,
            regEmail: email,
            regHp: noHp,
            regTglLahir: tglLahir,
            regKelamin: kelamin,
            regUsername: username,
            regPassword: password,
            regPasswordConfirmation: passwordConfirmation
        };
        
        if (registerData) {
            // console.log(registerData);
            // resolve("Stuff worked!");
            resolve(registerData);
            // res.send('Registrasi berhasil!');
            return;
        }
        else {
            reject(Error);
        }
    });*/

    /*promise.then(function(result) {
        var query = pool.query(
            'INSERT INTO `users`(`nama_person`, `email`, `no_hp`, `tgl_lahir`, `jenis_kelamin`, `username`, `password`) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [result.regName, result.regEmail, result.regHp, result.regTglLahir, result.regKelamin, result.regUsername, result.regPassword]
        );

        // if success
        if(query){
            // return query as object
            console.log("Successfully create new user!");
            var untukLogin = {
                body: {
                    username: result.regUsername,
                    password: result.regPassword
                }
            };
            return untukLogin;
            // resolve(query);
        } else {
            // throw error
            reject(Error);
        }
    }).catch(function(error){
        // reject(error);
        console.log(error);
    }).then(function(req){*/
        /*req.untukLogin = {
            username: req.regUsername,
            password: req.regPassword 
        };*/
        // console.log(req.body);
        // request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ })
        /*request.post({
            url:'http://192.110.110.72:5000/auth', 
            // form: {body: JSON.stringify({username: req.body.username, password: req.body.password})}},
            multipart: {
                chunked: false,
                data: [
                    {
                    'content-type': 'application/json',
                    body: JSON.stringify({username: req.body.username, password: req.body.password})
                    }
                ]
            },
            function(err, res, body){
                if(err){
                    console.log(err);
                } 
                console.log(res.statusCode);
                console.log('==========================');
                console.log(body);
                
            }
        });
        // var data = '{"body:" {"username":' + req.body.username + ', "password":' + req.body.password + '}}';
        var data = {
            body: {
                username: req.body.username, 
                password: req.body.password
            }
        };*/
        // var json_obj = JSON.parse(data);

        


        /*request.post({url:'http://service.com/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
        });*/
          // res.send("body");

        // var authRouter = require('../auth');
        // app.use('/', authRouter(req));
    /*}).catch(function(error){
        // reject(error);
        console.log(error);
    });

    let options = {
        url: 'http://192.110.110.72:5000/auth',
        form: {
            username: req.body.username,
            password: req.body.password
        }
    };
    
    request.post(options, function(error, response, body){
        // console.log(error);
        // console.log(response);
        // console.log(body);
        // res.redirect('/');
        res. send(options);
    });*/

    // promise.then(function(req, res){
        
    // }).catch(function(error){
    //     console.log(error);
    // });
});

module.exports = router;