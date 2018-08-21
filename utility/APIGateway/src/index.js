const express = require('express'); 
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('./auth/strategy');

var app = express();

app.use(passport.initialize());

//The following needs to be initialized before any route initialization 
//otherwise request processing for routes are not applied for the routes  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/api',require('./auth/auth'));
app.use('/api',require('./user/user'));

require('./db').connect();

module.exports = app;
