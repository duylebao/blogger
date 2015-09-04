let User = require('./user');
let passport = require('passport');
let flash = require('connect-flash');

module.exports = (app) => {

    app.get('/', (req, res) => {
        res.render('index.ejs', {});
    });

    app.get('/loginForm', (req, res) => {
        res.render('login.ejs', {message: req.flash('error')});
    });

    app.get('/signupForm', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error')});
    });
    // process the login form
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/loginForm',
        failureFlash: true
    }));

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signupForm',
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
};