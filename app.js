const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql');
const request = require('request');

var router = express.Router();
var pool = require('./database');
// var auth = require('./auth');
var indexRouter = require('./routes/front_office/index');
var loginRouter = require('./routes/login');
// var cartRouter = require('./routes/front_office/cart');
var authRouter = require('./routes/auth');
var registerRouter = require('./routes/front_office/register');

const app = express();
const port = 5000;
var isExist = false;

// app.use(cookieParser("kunciRahasia#BakoelGame@2019"));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());  
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder

// Cookie Parser
app.use(cookieParser("kunciRahasia#BakoelGame@2019"));

const cookieConfig = {
    httpOnly: true, // to disable accessing cookie via client side js
    //secure: true, // to force https (if you use it)
    maxAge: 1000*60, // ttl in ms (remove this option and cookie will die when browser is closed) 1000*60*60*24*7
    signed: true // if you use the secret with cookieParser
};// there is many other params you can find here https://www.npmjs.com/package/cookie#options-1

app.get('/', function(req, res){
    var getJenisProduk = indexRouter.initJenisProduk();
    var getKategoriProduk = indexRouter.initKategoriProduk();
    var cekCookieToSession = '';

    getCookie = authRouter.isLoggedIn(req.signedCookies.BGToken);
    // console.log("cekCookieToSession original: " + cekCookieToSession);
    // console.log("APAKAH MUNCUL: " + cekCookieToSession);

    getJenisProduk
    .then(function(result){
        return result;
    })
    .catch(function(error){
        console.log(error);
    });

    getKategoriProduk
    .then(function(result){
        return result;
    })
    .catch(function(error){
        console.log(error);
    });

    //var dataCoba = [nama : 'wasem'];
    Promise.all([getCookie, getJenisProduk, getKategoriProduk]).then(function(resultFromPromiseAll){
        getUsername = authRouter.getUsernameFromSessionRedis(req.signedCookies.BGToken);
        getUsername.then(function(usernamePromise){
            res.render('../views/front_office/index.ejs'/*, { 
                isLoggedIn: resultFromPromiseAll[0].status,
                username: usernamePromise.toUpperCase(),
                listJenisProduk: resultFromPromiseAll[1], 
                listKatProduk: resultFromPromiseAll[2], 
                userRole: 5
            }*/);
        }).catch(function(error){
            console.log(error);
        });
    })
    .catch(function(error){
        console.log(error);
    });
});

app.get('/register', function(req, res){
    res.render('../views/front_office/register.ejs');
});

app.get('/cookie', function(req, res){
    indexRouter.cookie();
});

app.get('/signout', function(req, res){
    authRouter.clearCookie(res);
    res.redirect('/');
});

app.get('/profile', authRouter.requiresLogin, function(req, res){
    res.send('HALAMAN PROFILE.');
});

app.post('/login', function(req, res){
    // tambahkan conditional pengecekan di database
    // START    
    // END

    var isExist;
    var initLogin = authRouter.initLogin(req.body.username, req.body.password);
    var generatedTokenRedis = authRouter.generateTokenRedis(req.body.username, req.ip);
    var generatedTokenCookie = authRouter.generateTokenCookie(req.body.username, req.ip);
    var getCookieFromBrowser = authRouter.getCookie(req);
    
    generatedTokenRedis.then(function(tokenValue){
        return tokenValue;
    })
    .then(function(tokenValue){
        var sessionRedis = authRouter.setSessionRedis(req.body.username, tokenValue);
        return sessionRedis.then(function(result){
            return result;
        }).catch(function(error){
            console.log(error);   
        });
    })
    .catch(function(error){
        console.log(error);
    });

    generatedTokenCookie.then(function(tokenValue){
        return tokenValue;
    })
    .then(function(tokenValue){   
        res.cookie("BGToken", tokenValue, cookieConfig);        
        return tokenValue;     
    })
    .catch(function(error){
        console.log(error);
    });

    getCookieFromBrowser.then(function(cookieValue){
        return cookieValue;
    });
    
    Promise.all([generatedTokenRedis, generatedTokenCookie, getCookieFromBrowser, initLogin])
    .then(function(result){
        /*console.log("Session Ambil Dari Redis: ");
        console.log(result[0]);
        console.log("==================================================");
        console.log("Session Ambil Dari Cookie: ");
        console.log(result[1]); 
        console.log("==================================================");
        console.log("Signed Cookie Dari Browser: ");
        console.log(result[2]);*/
        if(result[3]){
            isExist = true;
        }
        
        if(isExist === true){
            res.redirect('/');
        } else {
            res.send("Data doesn't exist");
        }
    })
    .catch(function(error){
        res.send(error);
    });
});

app.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var noHp = req.body.no_hp;
    var tglLahir = req.body.dob;
    var kelamin = req.body.gender;
    var userRole = 5;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirmation = req.body.password_confirmation;

    var registerData = {
        regName: name,
        regEmail: email,
        regHp: noHp,
        regTglLahir: tglLahir,
        regKelamin: kelamin,
        regUserRole: userRole,
        regUsername: username,
        regPassword: password,
        regPasswordConfirmation: passwordConfirmation
    };

    var setNewUser = authRouter.setNewUser(registerData);

    setNewUser.then(function(result){
        return new Promise(function(resolve, reject){
            if(result.affectedRows === 1){
                result.message = "record no. " + result.insertId + " succesfully inserted";
                // resolve("REGISTRASI BERHASIL");
                res.redirect('/');
            } else {
                reject(error);
            }    
        });
    });
});

//general error handler
/*app.use(function(error, req, res, next) {
    // res.locals.error = err; //get error thrown from another-route above
    res.send("ANDA TIDAK MEMILIKI HAK AKSES");
});*/

/*app.post('/login', function(req, res){
    var promise = indexRouter.initJenisProduk();

    promise
    .then(function(dataJenisProduk){
        // console.log(dataJenisProduk);
        return indexRouter.initKategoriProduk();
    })
    .then(function(dataKatProduk){
        console.log(dataKatProduk);
        console.log(dataJenisProduk);
        res.send(dataKatProduk);
    })
});*/

/*app.post('/login', function(req, res){
    var loginProc = loginRouter.loginProceed(req, res);

    return new Promise(function(resolve, reject){
        loginProc.then(function(result){
            res.send(result);
        }).catch(function(error){
            console.log("error dari app.post /login");
            res.send(error);
        });
    });
});*/


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
