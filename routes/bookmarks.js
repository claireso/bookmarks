var express = require('express'),
    router = express.Router(),

    Bookmark = require('../models/bookmark'),
    utils = require('../utils/function'),
    middleware = require('./middleware/middleware'),

    isLogged = middleware.isLogged,
    getCategories = middleware.getCategories;

/* GET form new*/
router.get('/new', isLogged, getCategories, function (req, res) {
    var data = {
        title: 'Add a new bookmark'
    };

    if (req.session.flashError) {
        data.errors = req.session.flashError;
        req.session.flashError = null;
    }

    res.render('bookmark/new', data);
});

/* POST form new*/
router.post('/new', isLogged, function (req, res) {
    var data = Bookmark.prepareData(req),
        bookmark = new Bookmark(data);

    bookmark.save(function (err, newBookmark) {
        if (err) {
            req.session.flashError = err.errors;
            res.redirect('/bookmark/new');
        } else {
            res.redirect('/');
        }
    });
});

/*DELETE one bookmark*/
router.get('/:id/delete', isLogged, function (req, res) {
    //call remove for trigger hook post remove (ie model)
    Bookmark.findById(req.params.id, function (err, bookmark) {
        bookmark.remove(function () {
            res.redirect(req.get('referer'));
        });
    });
});

/*GET edit form*/
router.get('/:id/edit', isLogged, getCategories, function (req, res) {
    var st = req.session.status;

    req.session.status = null;

    Bookmark.findById(req.params.id, function (err, bookmark) {
        var data = {
            bookmark: bookmark
        };

        if (st) {
            data.status = st;
        }
        
        res.render('bookmark/form/edit', data);
    });
});

/*PUT edit form*/
router.put('/:id/edit', isLogged, getCategories, function (req, res) {
    
    var data = Bookmark.prepareData(req),
        st = {
            success: {
                msg: 'Your bookmark has been updated',
                type: 'success'
            },
            error: {
                msg: 'An error has occured',
                type: 'error'
            }
        };

    Bookmark.findByIdAndUpdate(req.params.id, data, function (err, bookmark) {
        req.session.status = (err) ?  st.error : st.success;
        res.redirect(req.get('referer'));
    });
});

module.exports = router;
