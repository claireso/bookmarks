/*
 * UTILITIES
 */

 //isempty
exports.validatePresenceOf = function(val){
    return val && val.length;
};

//isEmail
exports.isEmail = function(val){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(val);
}

//trim
exports.trim = function(val){
    val = val.replace(/^\s+/, '');

    return val;
}