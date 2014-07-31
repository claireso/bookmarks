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

/* GET users listing. */
router.get('/:tag', isLogged, getCategories, function (req, res) {
    var tag = req.params.tag,
        page = req.query.page > 0 ? req.query.page : 1;


    Bookmark.paginate({
        page: page,
        filters : {'tags': tag},
        sort: {'created_at': -1}
    }, function(err, bookmarks, pager) {
        
        pager.baseUrl = url.parse(req.originalUrl).pathname;

        console.log(pager);

        res.render('bookmark/list', {
            title: '#' + tag,
            bookmarks: bookmarks,
            pager: pager
        });
    });


    // Bookmark
    // .find({
    //     'tags': tag
    // })
    // .sort({
    //     'created_at': -1
    // })
    // .exec(function (err, bookmarks) {
    //     res.render('bookmark/list', {
    //         title: '#' + tag,
    //         bookmarks: bookmarks
    //     });
    // });
});

module.exports = router;
