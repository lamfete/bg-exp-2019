const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const path = require('path');
const async = require('async');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

const app = express();
const port = 5000;

// create connection to database
const dbWrite = mysql.createConnection({
    host: '192.110.110.72',
    user: 'xiang',
    password: '@Jepara68',
    database: 'bakoelgame'
});

const dbRead = mysql.createConnection({
    host: '192.110.110.73',
    user: 'xiang',
    password: '@Jepara68',
    database: 'bakoelgame'
});

// redis connection
redisClient.on('connect', function() {
    console.log('Redis client connected');
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// connect to database
dbWrite.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('Connected to database write yudistira');    
});
global.dbWrite = dbWrite;

dbRead.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('Connected to database read bima');    
});
global.dbRead = dbRead;

// use redis as session store
// pass redis credentials and port information
// and express do the rest
app.use(session({
	secret: 'BakoelGame@2019',
	name: '_redisPractice',
	// create new redis store
	store: new redisStore({ host: '192.110.110.72', port: 6379, client: redisClient, ttl: 260}),
	resave: false,
	saveUninitialized: false
}));

app.use(cookieParser("kunciRahasia#BakoelGame@2019"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		dbRead.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log(results.length);
				request.session.loggedin = true;
				request.session.username = username;
				// console.log(results[0].username);
                // redisClient.set('session', results[0].username, redis.print);
				// redisClient.set('isLoggedIn', true);
				response.redirect('/');
				// response.render('./front_office/index.ejs', {isLoggedIn: "yes"});
				redisClient.get('session', function (error, result) {
					if (error) {
						console.log(error);
						throw error;
					}
					// console.log('GET result ->' + result);
				});
			} else {
				// var resp = {message: 'Incorrect Username and/or Password!!!'};
				redisClient.set('isLoggedIn', false);
				var resp = redisClient.get('isLoggedIn');
				console.log("MUNCUL APA DISINI: " + resp);
				response.render('./front_office/index.ejs', {isLoggedIn: resp});
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

var auth = function(req, res, next) {
	if (req.body.username === "amy" && req.body.password === "amy")
	//   return next();
		next();
	else
	//   return res.sendStatus(401);
	var resp = {message: 'Incorrect Username and/or Password!!!'};
	// 			app.get('/', resp);
	// res.render('index', {message: "Incorrect Username and/or Password!!!"});
	res.render('../views/front_office/index.ejs', {isLoggedIn: "tes"});
  };

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
// app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// app.get('/', getHomePage);
app.get('/', auth, function(req, res) {
	res.render('../views/front_office/index.ejs', {isLoggedIn: "tes", tesAja: "satu"});
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
