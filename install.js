var mongoose = require('mongoose'),
    User = require('./models/user'),
    utils = require('./utils/function'),
    config = require('./config');

var EMAIL,
    PASSWORD,
    stdin = process.stdin, 
    stdout = process.stdout;

var env = process.argv.slice(2)[0] || 'development';

mongoose.connect(config.db[env].uri);

function ask(param) {
 
 var question = param.question,
     validate = param.validate,
     errorMsg = param.errorMsg,
     callback = param.callback;

 stdin.resume();
 stdout.write(question + ": ");
 
 stdin.once('data', function(data) {
   data = data.toString().trim();
 
   if(!validate(data)){
      stdout.write(errorMsg + "\n");
      ask(param);
   } else {
     callback(data);
   }
 });
}


stdout.write('Welcome to Bookmarks! ' + "\n");
stdout.write('Before to continue, you need to create your account ' + "\n");

ask({
    question : 'Enter your email',
    errorMsg : 'Please, enter a valid email',
    validate: function(email){
        return utils.isEmail(email);
    },
    callback: function(data){
        EMAIL = data;
        //ask password
        ask({
            question : 'Enter your password',
            validate: function(){
                return true
            },
            callback: function (data){
                PASSWORD = data;

                User.remove({},function(err){
    
                    if(err){
                        console.log('Error: ' + err);
                    }

                    //Create the admin user
                    var admin = new User({
                        email: EMAIL,
                        password: PASSWORD,
                        passwordConfirm: PASSWORD
                    });

                    admin.save(function(error, user){
                        stdout.write('Your account has been created ' + "\n");
                        stdout.write('Email: ' + user.email + "\n");
                        stdout.write('Password: ' + PASSWORD);
                        process.exit(1);
                    });
                });
            }
        })
    }
});