var express = require('express');
var router = express.Router();

var User = require('../models/user'),
    Bookmark = require('../models/bookmark'),
    url = require('url'),
    middleware = require('./middleware/middleware');

var isLogged = middleware.isLogged;
var getCategories = middleware.getCategories;

/* GET home page. */
router.get('/', isLogged, getCategories, function(req, res) {
    var errors = req.session.flashError,
        success = req.session.flashSuccess,
        categories = res.locals.categories;
        
    delete req.session.flashError;
    delete req.session.flashSuccess;

    var data = {};

    if (errors) {
        data.errors = errors;
    }

    if (success) {
        data.success = success;
    }

    if (!categories.length) {
        res.render('index', data);   
    } else {
        Bookmark.getLatest(15, function(bookmarks){
            data.bookmarks = bookmarks;
            res.render('index', data);
        });
    }

});

/* GET Login. */
router.get('/login', function(req, res) {
    var err = req.session.flashError,
      data = { 
        title: 'Login',
        tplId: 'tpl--login'
      };

    if (req.session.user) {
        res.redirect('/');
    }

    if (err) {
        data.errors = err;
        delete req.session.flashError;
    }

    res.render('user/login', data);
});

/* POST Login*/
router.post('/login', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        
        if (user && user.authenticate(req.body.password)) {
            req.session.user = user;
            res.redirect('/');
        } else {
            req.session.flashError = 'Bad login or password';
            res.redirect('/login');
        }
    });
});

/* GET Logout*/
router.get('/logout', isLogged, function(req, res) {
    req.session.user = null;
    res.redirect('/');
});

/* GET forgotten password*/
router.get('/forgotten-password', function(req, res){
    var err = req.session.flashError,
        data = { 
            title: 'Forgotten password'
        };

    if (err) {
        data.errors = err;
        delete req.session.flashError;
    }

    res.render('user/forgottenpassword', data);
});

/* POST forgotten password*/
router.post('/forgotten-password', function(req, res) {
    var host = req.get('origin');
    
    User.findOne({email: req.body.email}, function(err, user) {

        if (null == user) {
            req.session.flashError = 'Email isn’t exist';
            res.redirect('/forgotten-password');
        } else {
            user.resetPassword(host, function(){
                res.render('user/forgottenpasswordconfirm');
            });
        }

    });
});

/* GET reset password*/
router.get('/reset/:token', function(req, res) {
    User.findOne({token: req.params.token}, function(err, user){
        if (null == user) {
            res.redirect('/');
        } else {
            res.render('user/resetpassword', 
                {
                    title: 'Reset password',
                    user: user
                }
            );
        }

    });
});

/* PUT reset password*/
router.put('/reset', function(req, res) {
    var data = req.body;

    User.findById(data.user_id, function(err, user){
        user.password = data.password;
        user.passwordConfirm = data.passwordConfirm;

        user.save(function(err, user){
            res.render('user/resetpasswordConfirm');
        });
    });
});

module.exports = router;
