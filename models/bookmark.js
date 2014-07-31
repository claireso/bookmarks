var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ValidationError = require('mongoose/lib/error/validation'),
    utils = require('../utils/function'),
    http = require('http'),
    url = require('url'),
    phantom = require('phantom'),
    fs = require('fs'),
    exec = require('child_process').exec,
    path = require('path'),

    UPLOADFOLDER = 'public/uploads/',
    bookmarkSchema,
    titleReg = /<title>(.*?)<\/title>/;

bookmarkSchema = mongoose.Schema({
    url: String,
    title: String,
    cover: String,
    note: String,

    categories: { type: Array, index: true, default: [ 'other' ] },
    tags: { type: Array, index: true },

    created_at: { type: Date, default: Date.now },
    updated_at: Date
});

/*
    INDEXES FOR SEARCH
*/
bookmarkSchema.index({ "title": "text", "note": "text", "tags": "text" });

/*
    VIRTUAL PATH
*/
bookmarkSchema.virtual('coverpath').get(function () { 
    return '/uploads/';
});

/*
    STATICS METHOD
*/

bookmarkSchema.statics.getCategories = function getCategories (callback) {

    this.distinct("categories", function (err, categories) {
        callback(categories.sort());
    });

};

bookmarkSchema.statics.getTags = function getTags (callback) {

    this.distinct("tags", function (err, tags) {
        callback(tags.sort());
    });

};

bookmarkSchema.statics.prepareData = function prepareData (req) {
    var data = {};

    if (utils.validatePresenceOf(req.body.categories)) {
        data.categories = req.body.categories;
    }

    if (utils.validatePresenceOf(req.body.newcategory)) {
        data.categories = data.categories || [];
        data.categories.push(req.body.newcategory);
    }

    if (utils.validatePresenceOf(req.body.tags)) {
        data.tags = req.body.tags.split(',');
        //remove whitespace
        if (data.tags.length) {
            data.tags.forEach(function (tag, index) {
                var t = utils.trim(tag);

                if (utils.validatePresenceOf(t)) {
                    data.tags[index] = t;    
                } else {
                    //remove tag of the list
                    data.tags.splice(index, 1);
                }                
            });
        }
    } else {
        data.tags = [];
    }

    if (utils.validatePresenceOf(req.body.url)) {
        data.url = req.body.url;
    }

    data.note = req.body.note || ''; 

    if (utils.validatePresenceOf(req.body.title)) {
        data.title = req.body.title;
    }

    return data;

};

bookmarkSchema.statics.getHomeList = function getHomeList (categories, callback) {
    var count = 0,
        total = categories.length,
        data = [];

    categories.forEach(function (category, index) {
        
        this
        .find({
            'categories': category
        })
        .sort({
            'created_at': -1
        })
        .limit(5)
        .exec(function (err, bookmarks) {
            count++;

            //ensure order
            data[index] = {
                category: category,
                bookmarks: bookmarks
            }

            if (count == total) {
                callback(data);
            }

        });

    }.bind(this));
}

bookmarkSchema.statics.getLatest = function getLatest (count, callback) {
    this
    .find()
    .sort({
        'created_at': -1
    })
    .limit(count)
    .exec(function (err, bookmarks) {
        if (err) {
            console.log('err ' + err );
        }
        callback(bookmarks);
    });
}

bookmarkSchema.statics.paginate = function paginate(params, callback) {
    var self = this,
        page = parseInt(params.page,10) || 1,
        filters = params.filters || {},
        limit = 5;

    callback = callback || function() {}

    this
    .find(filters)
    .count()
    .exec(function(err, count) {
        if (err) {
            console.log(err);
        }

        var query = self.find(filters).skip((page - 1) * limit).limit(limit);

        if (params.sort) {
            query.sort(params.sort);
        }

        query.exec(function(err, bookmarks){
            callback(err, bookmarks, {page: page, total: Math.ceil(count / limit)});
        });
    })

};

/*
    HOOKS
*/

bookmarkSchema.pre('save', function (next) {

    var self = this,
        errors;

    if (!utils.validatePresenceOf(this.url)) {
        errors = errors || new ValidationError(this);
        errors.errors.url = {
            path: 'url',
            type: 'You must enter an url',
            value: this.url
        }
    }

    if (errors) {
        next(errors)
    } else {

        var book_url = url.parse(this.url),
            options = {
                host: book_url.host,
                path: book_url.path
            };

        var httpRequest = http.request(options, function (res) {
            var data = '';
            
            res.on('data', function (chunk) {
                data += chunk;
            });
            
            res.on('end', function () {
                var title = data.match(titleReg);

                self.title = (title && title.length) ? title[1] : self.url;
                
                //@todo
                //create screenshot
                phantom.create(function (ph) {
                    ph.createPage(function (page) {

                        page.set('viewportSize', { width: 1280, height: 800 });
                        page.set('clipRect', { top: 0, left: 0, width: 1280, height: 800 });

                        page.open(self.url, function () {
                            
                            var filename = self._id + '.png',
                                img = path.join(__dirname + '/../' + UPLOADFOLDER, filename);

                            setTimeout(function () {
                                page.render( UPLOADFOLDER + filename);
                                ph.exit();
                                
                                self.cover = filename;

                                setTimeout(function () {
                                    //timeout for draw the preview
                                    //resize image
                                    //convert site.png -resize 640x400 site.png
                                    exec('convert ' + img + ' -resize 640x400 ' + img, function (error, stdout, stderr) {
                                        
                                        if (error !== null) {
                                            console.log('exec error: ' + error);
                                        }
                                        
                                        next();    
                                        
                                    });
                                }, 900);
                            }, 1000);
                            
                        })
                    });
                });
            });
        });

        httpRequest.on('error', function (e) {
            errors = errors || new ValidationError(this);
            errors.errors = 'error';
            next(errors);
        });

        httpRequest.end();
    }

});

bookmarkSchema.post('remove', function (bookmark) {
    fs.unlink('public/uploads/' + bookmark.cover, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

var Bookmark = mongoose.model('Bookmark', bookmarkSchema);

Bookmark.ensureIndexes(function (err) {
    if (err) {
        console.log('err ' + err);
    }
})

module.exports = Bookmark;
