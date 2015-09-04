let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let nodeifyit = require('nodeifyit');
let crypto = require('crypto');
let flash = require('connect-flash');
let mongoose = require('mongoose');
let User = require('./user');

mongoose.connect('mongodb://127.0.0.1:27017/demo');

// Will allow crypto.promise.pbkdf2(...)
require('songbird');

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;
const SALT = 'salt';

let app = express();

process.on('uncaughtException', function(err) {
    console.log('uncaughtException: \n\n', err.stack);
    // IMPORTANT! (optionally, soft exit)
    process.exit();
});

process.on('unhandledRejection', (err, rejectedPromise) => {
    console.log('unhandledRejection: \n\n', err.stack);
});

// Use ejs for templating, with the default directory /views
app.set('view engine', 'ejs');

app.use(flash());

// Read cookies, required for sessions
app.use(cookieParser('ilovethenodejs'));

// Get POST/PUT body information (e.g., from html forms like login)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory session support, required by passport.session()
app.use(session({
  secret: 'ilovethenodejs',
  resave: true,
  saveUninitialized: true
}));

// Use the passport middleware to enable passport
app.use(passport.initialize());

// Enable passport persistent sessions
app.use(passport.session());

// SETTING UP PASSPORT

passport.serializeUser(nodeifyit(async (user) => user.email));

passport.deserializeUser(nodeifyit(async (email) => {
    return await User.findOne({email}).exec();
}));

// login strategy
passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email'
}, nodeifyit(async (email, password) => {
    email = (email || '').toLowerCase();
    // get user from db
    let user = await User.promise.findOne({email});
    if (email !== user.email) {
        return [false, {message: 'Invalid username'}];
    }
    let hash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
    if (hash != user.password) {
       return [false, {message: 'Invalid password'}]
    }
    return user;
}, {spread: true})));


// signup strategy
passport.use('local-signup', new LocalStrategy({
   // Use "email" field instead of "username"
   usernameField: 'email',
   passReqToCallback: true
}, nodeifyit(async (req, email, password) => {
    email = (email || '').toLowerCase()
    let username = req.body.username;
    // Is the email taken?
    // if (await User.promise.findOne({email})) {
    //     return [false, {message: 'That email is already taken.'}];
    // }
    
    let user = new User();
    if (await user.getUserByUsernameOrEmail(username, email)) {
        return [false, {message: 'That email or username is already taken.'}];
    }

    if (!await user.isValidPassword(password)) {
        return [false, {message: 'Password must be alpha numeric'}];
    }

    // need to double check
    if (!await user.isAlphnumeric(username)) {
        return [false, {message: 'Password must be alpha numeric'}];
    }

    // create the user
    user.email = email;
    user.username = username;
    let hash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
    user.password = hash;
    return await user.save();
}, {spread: true})));


// ROUTING

// And add your root route after app.listen
app.get('/', (req, res) => {
    res.render('index.ejs', {message: req.flash('error')});
});

// process the login form
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next()
    res.redirect('/')
};

app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs', {user: req.user});
});

app.get('/logout', function(req, res){
   req.logout();
   res.redirect('/');
});

// start server 
app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))
