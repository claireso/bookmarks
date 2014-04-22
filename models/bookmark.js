var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ValidationError = require('mongoose/lib/error/validation'),
    utils = require('../utils/function'),
    http = require('http'),
    url = require('url'),
    phantom = require('phantom'),
    fs = require('fs');


var bookmarkSchema = mongoose.Schema({
    url        : String,
    title      : String,
    cover      : String,
    note      : String,

    categories : { type: Array, index: true, default: ['other'] },
    tags       : { type: Array, index: true },

    created_at : {type   : Date, default : Date.now},
    updated_at : Date
});

bookmarkSchema.statics.getCategories = function getCategories(callback) {

    // this.mapReduce({
    //     map : function map(){

    //         if (!this.categories) {
    //             return;
    //         }

    //         for (index in this.categories) {
    //             emit(this.categories[index], 1);
    //         }
    //     },
    //     reduce : function reduce(previous, current){
            
    //         var count = 0;

    //         for (index in current) {
    //             count += current[index];
    //         }

    //         return count;
    //     }
    // }, callback);

    this.distinct("categories", function(err, categories){
        callback(categories.sort());
    });

};

bookmarkSchema.statics.getTags = function getTags(callback) {

    this.distinct("tags", function(err, tags){
        callback(tags.sort());
    });

};

bookmarkSchema.statics.prepareData = function prepareData(req){
    var data = {};

    if(utils.validatePresenceOf(req.body.categories)){
        data.categories = req.body.categories;
    }

    if(utils.validatePresenceOf(req.body.newcategory)){
        data.categories = data.categories || [];
        data.categories.push(req.body.newcategory);
    }

    if(utils.validatePresenceOf(req.body.tags)){
        data.tags = req.body.tags.split(',');
    }

    if(utils.validatePresenceOf(req.body.url)){
        data.url = req.body.url;
    }

    if(utils.validatePresenceOf(req.body.note)){
        data.note = req.body.note;
    }

    if(utils.validatePresenceOf(req.body.title)){
        data.title = req.body.title;
    }

    return data;
};

bookmarkSchema.statics.getHomeList = function getHomeList(categories, callback){
    var count = 0,
        total = categories.length,
        data = [];

        categories.forEach(function(category, index){
            
            this.find({categories:category})
                .sort({
                    'created_at': -1
                })
                .limit(5)
                .exec(function(err, bookmarks){
                    count ++;

                    //ensure order
                    data[index] = {
                        category: category,
                        bookmarks: bookmarks
                    }

                    if(count == total){
                        callback(data);
                    }

                });

        }.bind(this));
}

bookmarkSchema.pre('save', function(next){

    var self = this,
        errors;

    if (!utils.validatePresenceOf(this.url)) {
        errors = errors || new ValidationError(this);
        errors.errors.url = {
            path : 'url',
            type: 'You must enter an url',
            value : this.url
        }
    }

    if(errors){
        next(errors)
    } else {

        //remove whitespace
        if(this.tags.length){
            this.tags.forEach(function(tag, index){
                var  t = utils.trim(tag);

                if (utils.validatePresenceOf(t)) {
                    self.tags[index] = t;    
                } else {
                    //remove tag of the list
                    self.tags.splice(index, 1);
                }                
            });
        }
        var book_url = url.parse(this.url),
            options = {
                host: book_url.host,
                path: book_url.path
            };

        var request = http.request(options, function (res) {
            var data = '';
            
            res.on('data', function (chunk) {
                data += chunk;
            });
            
            res.on('end', function () {
                var titleReg = /<title>(.*)<\/title>/,
                    title = data.match(titleReg);
                    self.title = (title && title.length) ? title[1] : self.url;
                    
                    //create screenshot
                    phantom.create(function(ph){
                        ph.createPage(function(page){
                            page.set('viewportSize', {width: 1280, height: 800});
                            page.set('clipRect', {top: 0, left: 0, width: 1280, height: 800});

                            page.open(self.url, function(){
                                
                                var filename = self._id+'.png';
                                page.render('public/uploads/'+filename);
                                ph.exit();
                                self.cover = filename;

                                setTimeout(function(){
                                    //timeout for draw the preview
                                    next();    
                                }, 200);
                                
                            })
                        });
                    });
            });
        });

        request.on('error', function (e) {
            errors = errors || new ValidationError(this);
            errors.errors = 'error';
            next(errors);
        });

        request.end();
    }

});

bookmarkSchema.post('remove', function(bookmark) {
    fs.unlink('public/uploads/' + bookmark.cover, function (err) {
      if (err) {
        console.log(error);
      }
    });
});

var Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;