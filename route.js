let User = require('./user');
let passport = require('passport');
let flash = require('connect-flash');
let multiparty = require('multiparty');
let then = require('express-then');
let Post = require('./post');
let fs = require('fs');
let DataUri = require('datauri');

require('songbird');

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

    app.get('/profile', isLoggedIn, then( async(req, res) => {
        let posts = await Post.promise.find({ userId: req.user._id });
        res.render('profile.ejs', {
                                    user: req.user,
                                    posts: posts
                                  });
    }));

    app.get('/post/:postId?', then( async (req, res) => {
        let postId = req.params.postId;
        if (!postId){
            res.render('post.ejs', {
                post: {},
                verb: 'create'
            });
            return;
        };
        let post = await Post.promise.findById(postId);
        if (!post){
            res.send(404, 'Not found');
            return;
        }
        let dataUri = new DataUri();
        let image = dataUri.format('.'+post.image.contentType.split('/').pop(), post.image.data);

        res.render('post.ejs', {
            post: post,
            verb: 'edit',
            image: `data:${post.image.contentType};base64,${image.base64}`
        });
    }));

    app.post('/post/:postId?', then(async (req, res) => {
        let postId = req.params.postId;
        let post;
        let date = new Date;
        if (!postId){
            post = new Post();
            post.created = date;
        }else{
            post = await Post.promise.findById(postId);
        }
        if (!post){
            res.send(404, 'Not found');
            return;
        }

        let [{title: [title], content: [content]},{image: [file]}] = await new multiparty.Form().promise.parse(req);

        post.updated = date;
        post.title = title;
        post.content = content;
        post.image.data = await fs.promise.readFile(file.path);
        post.image.contentType = file.headers['content-type'];
        post.userId = req.user._id;

        await post.save();
        //res.redirect('/blog/' + encodeURI(req.user.blogname));
        res.redirect('/profile');
        return;
    }));

    app.get('/deletepost/:postId?', then(async (req, res) => {
        let postId = req.params.postId;
        let post = await Post.promise.findById(postId);
        if (!post){
            res.send(404, 'Not found');
            return;
        }

        await post.remove();
        res.redirect('/profile');
        return;
    }));   

    app.get('/blog/:blogname?', then( async (req, res) => {
        res.render('blog.ejs', {} );
    }));

    app.get('/logout', function(req, res){
       req.logOut();
       res.redirect('/');
    });
};