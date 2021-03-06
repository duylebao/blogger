let User = require('./user');
let passport = require('passport');
let flash = require('connect-flash');
let multiparty = require('multiparty');
let then = require('express-then');
let Post = require('./post');
let Blog = require('./blog');
let fs = require('fs');
let DataUri = require('datauri');

require('songbird');

module.exports = (app) => {

    app.get('/', (req, res) => {
        res.render('index.ejs', {});
    });

    app.get('/login', (req, res) => {
        if (req.query.retUrl){
            req.session.returnTo = req.query.retUrl; 
        }
        res.render('login.ejs', {message: req.flash('error')});
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error')});
    });
    // process the login form
    app.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
        if (req.session.returnTo){
            let ret = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(ret);
        }else{
            res.redirect('/profile');
        }
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next()
        res.redirect('/')
    };

    app.get('/profile', isLoggedIn, then( async(req, res) => {
        let posts = await Post.promise.find({ username: req.user.username });
        let data = [];
        let comments = [];
        for(let i = 0; i < posts.length; i++){
            let post = posts[i];
            let blogs = await Blog.promise.find({postId: post._id});
            comments = comments.concat(blogs);
            data.push({post: post, blogcount: blogs.length});
        }
        res.render('profile.ejs', {
                                    user: req.user,
                                    posts: data,
                                    blogs: comments
                                  });
    }));

    app.get('/post/:postId?', isLoggedIn, then( async (req, res) => {
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

    app.post('/post/:postId?', isLoggedIn, then(async (req, res) => {
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
        if (file && file.size > 0){
            post.image.data = await fs.promise.readFile(file.path);
            post.image.contentType = file.headers['content-type'];
        }
        post.username = req.user.username;

        await post.save();
        res.redirect('/profile');
        return;
    }));

    app.get('/deletepost/:postId?', isLoggedIn, then(async (req, res) => {
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

    app.get('/blog/:postId?', then( async (req, res) => {
        let postId = req.params.postId;     
        let posts;
        if (postId){
            posts = await Post.promise.find({_id: postId});    
            if (!posts){
                res.send(404, 'Not found');
                return;
            }      
        }else{
            posts = await Post.promise.find({});
        };
        let dataUri = new DataUri();
        let imagePosts = [];
        for(let i = 0; i < posts.length; i++){
            let post = posts[i];
            let image = dataUri.format('.'+post.image.contentType.split('/').pop(), post.image.data);
            let blogs = await Blog.promise.find({ postId: post._id});
            imagePosts.push({
                image: `data:${post.image.contentType};base64,${image.base64}`,
                post: post,
                blogs: blogs
            });
        }
        res.render('blog.ejs', { posts: imagePosts, user: req.user} );
    }));

    app.post('/blog', isLoggedIn, then( async (req, res) => {

        let {username, postId, comment} = req.body;
        let blog = new Blog();
        blog.comment = comment;
        blog.username = username;
        blog.postId = postId;
        blog.created = new Date;

        await blog.save();        
        res.redirect('/blog/'+postId);
        return;
    }));

    app.get('/logout', function(req, res){
       req.logOut();
       res.redirect('/');
    });
};