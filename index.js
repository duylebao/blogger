let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('connect-flash');
let mongoose = require('mongoose');
let passport = require('passport');
let passportMiddleware = require('./passport');
let route = require('./route');


mongoose.connect('mongodb://127.0.0.1:27017/demo');

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;

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

passportMiddleware(app);
route(app);


// start server 
app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))
