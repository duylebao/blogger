let LocalStrategy = require('passport-local').Strategy;
let nodeifyit = require('nodeifyit');
let crypto = require('crypto');
let passport = require('passport');
let User = require('./user');

require('songbird');

const SALT = 'salt';

module.exports = (app) => {
    passport.serializeUser(nodeifyit(async (user) => user._id));

    passport.deserializeUser(nodeifyit(async (id) => {
        return await User.promise.findById(id);
    }));

    // login strategy
    passport.use(new LocalStrategy({
        usernameField: 'username'
    }, nodeifyit(async (username, password) => {
        let user = new User();
        let msg = 'Invalid username or password';
        user = await user.getUserByUsernameOrEmail(username, username);
        if (!user){
            return [false, {message: msg}]
        }
        let hash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
        if (hash != user.password) {
           return [false, {message: msg}]
        }       
        return user;
    }, {spread: true})));


    // signup strategy
    passport.use('local-signup', new LocalStrategy({
       usernameField: 'username',
       passReqToCallback: true
    }, nodeifyit(async (req, username, password) => {
        let {email, blogname, blogdesc} = req.body;
        email = (email || '').toLowerCase();
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
        user.blogname = blogname;
        user.blogdesc = blogdesc;
        let hash = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
        user.password = hash;
        return await user.save();
    }, {spread: true})));
};