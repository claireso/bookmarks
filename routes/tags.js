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

/* GET users listing. */
router.get('/:tag', isLogged, getCategories, function (req, res) {
    var tag = req.params.tag;

    Bookmark
    .find({
        'tags': tag
    })
    .sort({
        'created_at': -1
    })
    .exec(function (err, bookmarks) {
        res.render('bookmark/list', {
            title: '#' + tag,
            bookmarks: bookmarks
        });
    });
});

module.exports = router;
