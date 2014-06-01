Bookmarks
====================
Bookmarks is a self hosted application to store your bookmarks.
It is build with Express 4 and MongoDB.
Today, this application is still in beta.

Install it
---------------------
Clone the project:
`git clone https://github.com/claireso/bookmarks.git`

Install the dependencies
```
cd bookmarks
npm install
```

Configure it
---------------------
Add the config.js file
```
cd bookmarks
touch config.js
```

Past this code in the config.js file and complete it
```
var config = {

    session: {
        secret: ''
    },

    db: {
        development: {
            uri: ''
        },
        production: {
            uri: ''
        }
    },

    mail: {
    
    }

}

// Export config
module.exports = config;

```

* **secret** : a string to protect your session
* **db.development.uri** : the uri of your database in development environment (ie : 'mongodb://localhost/bookmarks')
* **db.development.uri** : the uri of your database in production environment
* **mail** : nodemailer is used to send mail if you forgot your password account. You need to add a SMTP configuration. Check the documentation [here](https://github.com/andris9/Nodemailer).    


 Create your account
---------------------
After the configuration of your application and starting your mongo server, you need to create your account. For this enter this command line:
```
node install.js development
```
Replace 'development' by 'production' if your environment is production.
The shell will asks you an email and a password.

Then, you can start your application : 
```
npm start
```


