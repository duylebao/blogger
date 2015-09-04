let LocalStrategy = require('passport-local').Strategy;
let nodeifyit = require('nodeifyit');
let crypto = require('crypto');
let passport = require('passport');
let User = require('./user');

const SALT = 'salt';

module.exports = (app) => {
    // Use the passport middleware to enable passport
    app.use(passport.initialize());

    // Enable passport persistent sessions
    app.use(passport.session());
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

        // need to double check
        if (!await user.isAlphaNumeric(username)) {
            return [false, {message: 'username must be alpha numeric'}];
        }
        
        if (!await user.isValidPassword(password)) {
            return [false, {message: 'Password must be < 3 in length, must contain a upper case letter and at least 1 digit'}];
        }

        // create the user
        user.email = email;
        user.username = username;
        let hash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
        user.password = hash;
        return await user.save();
    }, {spread: true})));
};