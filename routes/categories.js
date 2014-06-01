var express = require('express'),
    router = express.Router(),

    Bookmark = require('../models/bookmark'),
    middleware = require('./middleware/middleware'),

    isLogged = middleware.isLogged,
    getCategories = middleware.getCategories;

/* GET root. */
router.get('/', isLogged, function (req, res) {
    res.redirect('/');
});

/* GET bookmarks by category. */
router.get('/:category', isLogged, getCategories, function (req, res) {
    var category = req.params.category;

    Bookmark
    .find({ 
        'categories': category
    })
    .sort({
        'created_at': -1
    })
    .exec(function (err, bookmarks) {
        res.render('bookmark/list', {
            title: category,
            bookmarks: bookmarks
        });
    });
});

module.exports = router;
