var express = require('express'),
    router = express.Router(),
    url = require('url'),

    Bookmark = require('../models/bookmark'),
    middleware = require('./middleware/middleware'),

    isLogged = middleware.isLogged,
    getCategories = middleware.getCategories;

/* GET SEARCH. */
router.get('/', isLogged, getCategories, function (req, res) {
    var term = req.query.term,
        data = {
            title: 'Search :"' + term + '"'
        },
        page = req.query.page > 0 ? req.query.page : 1;


    Bookmark.paginate({
        page: page,
        filters : {
            $text: {
                $search: term
            }
        },
        sort: {'created_at': -1}
    }, function(err, bookmarks, pager) {

        pager.baseUrl = url.parse(req.originalUrl).pathname;

        if (err) {
            console.log('error ' + err);
        }

        data.bookmarks = bookmarks;
        data.pager = pager;
        data.term = term;

        res.render('bookmark/list', data);
    });

});

module.exports = router;
