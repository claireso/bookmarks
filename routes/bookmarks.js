var express = require('express');
var router = express.Router();

var Bookmark = require('../models/bookmark'),
    utils = require('../utils/function'),
    middleware = require('./middleware/middleware');

var isLogged = middleware.isLogged;
var getCategories = middleware.getCategories;

/* GET form new*/
router.get('/new', isLogged, getCategories, function(req, res) {
    var data = {
        title : 'Add a bookmarks'
    };

    if (req.session.flashError) {
        data.errors = req.session.flashError
        req.session.flashError = null;
    }

    res.render('bookmark/new', data);
});

/* POST form new*/
router.post('/new', isLogged, function(req, res) {
    var data = Bookmark.prepareData(req);

    var bookmark = new Bookmark(data);

    bookmark.save(function(err, newBookmark){
        if (err) {
            req.session.flashError = err.errors;
            res.redirect('/bookmark/new');
        } else {
            res.redirect('/');
        }

    });
});

/*DELETE one bookmark*/
router.get('/:id/delete', isLogged, function(req, res) {
    //call remove for trigger hook post remove (ie model)
    Bookmark.findById(req.params.id, function(err, bookmark){
        bookmark.remove(function(){
            res.redirect(req.get('referer'));
        });
    });
    /*Bookmark.findByIdAndRemove(req.params.id, function(err, result){
        res.redirect(req.get('referer'));
    });*/
});

/*GET edit form*/
router.get('/:id/edit', isLogged, getCategories, function (req, res) {
    var st = req.session.status;
    req.session.status = null;

    Bookmark.findById(req.params.id, function(err, bookmark){
        
            var data = {
                bookmark : bookmark
            };

            if (st) {
                data.status = st;
            }
            
            res.render('bookmark/form/edit', data);
        
    });
});

/*PUT edit form*/
router.put('/:id/edit', isLogged, getCategories, function (req, res) {
    
    var data = Bookmark.prepareData(req);

    Bookmark.findByIdAndUpdate(req.params.id, data, function(err, bookmark){
        var st = {
            success : {
                msg : 'Your bookmark has been updated',
                type : 'success'
            },
            error : {
                msg : 'An error has occured',
                type : 'error'
            }
        }
        req.session.status = (err) ?  st.error : st.success;
        res.redirect(req.get('referer'));
    });
});

module.exports = router;
