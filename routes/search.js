var express = require('express'),
    router = express.Router(),

    Bookmark = require('../models/bookmark'),
    middleware = require('./middleware/middleware'),

    isLogged = middleware.isLogged,
    getCategories = middleware.getCategories;

/* GET SEARCH. */
router.get('/', isLogged, getCategories, function (req, res) {
    var term = req.query.term,
        data = {
            title: 'Search :"' + term + '"'
        };

    Bookmark
    .find({
        $text: {
            $search: term
        }
    })
    .sort({
        'created_at': -1
    })
    .exec(function (err, bookmarks) {
        if (err) {
            console.log('error ' + err);
        }

        data.bookmarks = bookmarks;

        res.render('bookmark/list', data);

    });

});

module.exports = router;
