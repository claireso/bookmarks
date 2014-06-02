var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    check = require('validator').check,
    crypto = require('crypto'),
    ValidationError = require('mongoose/lib/error/validation'),
    utils = require('../utils/function'),
    email = require('../utils/mail'),
    userSchema;

userSchema = mongoose.Schema({
    email: {
        type: String,
        //required: [ true, 'Field {path} is required.' ]
        validate: [
            {
                validator: utils.validatePresenceOf,
                msg: 'Email can’t be empty'
            },
            {
                validator: utils.isEmail,
                msg: 'Your email is not valid'
            }
        ],
        unique: true,
        index: true
    },
    hashed_password: String,
    salt: String,
    pseudo: String,
    name: {
        first: String,
        last: String,
    },
    token: String,
    created_at: { type: Date, default: Date.now },
    updated_at: Date
});

userSchema.path('email').index({ unique: true });

userSchema.method('makeSalt', function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
});

userSchema.method('encryptPassword', function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

userSchema.method('authenticate', function (password) {
    return this.encryptPassword(password) === this.hashed_password;
});

userSchema.method('resetPassword', function (host, fn) {
    var self = this,
        token = new mongoose.Types.ObjectId;

    this.update({ token: token }, function () {
        email.send(self, token, host, function () {
            fn();
        })    
    });
});

/*
    VIRTUAL
*/

userSchema
.virtual('passwordConfirm')
.set(function (passwordConfirm) {
    this._passwordConfirm = passwordConfirm;
})
.get(function () { 
    return this._passwordConfirm; 
});

userSchema
.virtual('password')
.set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
})
.get(function () { 
    return this._password; 
});

userSchema.pre('save', function (next) {
    var self = this,
        errors;

    if (!utils.validatePresenceOf(this.email)) {
        errors = errors || new ValidationError(this);
        errors.errors.email = {
            path: 'email',
            type: 'Your email is required',
            value: this.email
        }
    }

    if (!utils.validatePresenceOf(this.password)) {
        errors = errors || new ValidationError(this);
        errors.errors.password = {
            path: 'password',
            type: 'Your password is not valid',
            value: this.password
        }
    }

    if (!utils.validatePresenceOf(this.passwordConfirm)) {
        errors = errors || new ValidationError(this);
        errors.errors.passwordConfirm = {
            path: 'passwordConfirm',
            type: 'Your password is not valid',
            value: this.passwordConfirm
        }
    }

    if (this.password !== this.passwordConfirm) {
        errors = errors || new ValidationError(this);
        errors.errors.passwordNotmath = {
            path: 'passwordConfirm',
            type: 'Your password and confirm password don’t match',
            value: this.passwordConfirm
        }
    }

    mongoose.models['User'].findOne({ email: this.email }, function (err, user) {
        if (user && !user.token) {
            errors = errors || new ValidationError(self);
            errors.errors.email = {
                path: 'email',
                type: 'Your email already exists',
                value: self.email
            }
        }

        //@todo
        if (user) {
            //update
            user.update({ token: null }, function () {
                if (errors) {
                    next(errors);
                } else {
                    self.pseudo = self.email.split('@')[0];
                    next();
                }
            });
        } else {
            //create
            if (errors) {
                next(errors);
            } else {
                self.pseudo = self.email.split('@')[0];
                next();
            }
        }
    });
});

var User = mongoose.model('User', userSchema);

module.exports = User;
