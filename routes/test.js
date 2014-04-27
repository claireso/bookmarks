var express = require('express');
var router = express.Router();

var request = require('request');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var config = require('../config');


/* GET root. */
router.get('/', function(req, res) {
  
    var img = path.join(__dirname, '../public/uploads/534ab36a925f8e1d0a67fdac.png'),
        remote = config.upload.remote,
        key = config.upload.key;

    // var r = request.post(remote, function optionalCallback (err, httpResponse, body) {
    //   if (err) {
    //     return console.error('upload failed:', err);
    //   }
    //   console.log('Upload successful!  Server responded with:', body);
    // });



    var form = new FormData();
    form.append('origin', key);
    form.append('file', fs.createReadStream(img));

    form.getLength(function(err,length){
        var r = request.post(remote, { headers: { 'content-length': length } }, function(err, res, body){ 
            if (err) {
                return console.error('upload failed:', err);
            }

            console.log(body) 
        });
        
        r._form = form
    });











    //form.append('remote_file', request('http://google.com/doodle.png'))

    // request(remote).pipe(fs.createReadStream(img)).on('end', function() {
    //     console.log('re');
    // })

    //r.pipe(form);

    // fs.createReadStream(img).pipe(request.post(remote, function callback(err, httpResponse, body) {
    //     console.log('response');
    //     if (err) {
    //         return console.error('upload failed:', err);
    //     }
    //     console.log('Upload successful!  Server responded with:', body);
    // }));

    // request.post(remote, {form:{key:fs.createReadStream(img)}}, function(err, httpResponse, body) {
    //     console.log('response');
    //     if (err) {
    //         return console.error('upload failed:', err);
    //     }
    //     console.log('Upload successful!  Server responded with:', body);
    // })

});



module.exports = router;
