var Bookmark = require('../../models/bookmark');

/*
 * ROUTES MIDDLEWARE
 */

//isLogged
exports.isLogged = function(req, res, next){
    if(!req.session.user){
        res.redirect('/login');
    } else {
        next();
    }
};

//getCategories
exports.getCategories = function(req, res, next){
    res.locals.activeCategory = req.params.category

    Bookmark.getCategories(function(categories){
        res.locals.categories = categories;
        next();
    });
};