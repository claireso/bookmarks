var express = require('express'),
    router = express.Router(),
    url = require('url'),

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
    var category = req.params.category,
        page = req.query.page > 0 ? req.query.page : 1;

        
    Bookmark.paginate({
        page: page,
        filters : { 'categories': category},
        sort: {'created_at': -1}
    }, function(err, bookmarks, pager) {
        
        pager.baseUrl = url.parse(req.originalUrl).pathname;

        res.render('bookmark/list', {
            title: category,
            bookmarks: bookmarks,
            pager: pager
        });
    });


    /*Bookmark.find({ 'categories': category}).count().exec(function(err, count){

        Bookmark.find({ 'categories': category})
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({
                'created_at': -1
            })
            .exec(function (err, bookmarks) {
                res.render('bookmark/list', {
                    title: category,
                    bookmarks: bookmarks,
                    pager: {
                        page: page,
                        total: Math.ceil(count / limit)
                    }
                });
            });

    });*/
});

module.exports = router;
