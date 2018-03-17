const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const googleauth = require('../google');
const fbauth = require('../facebook');
const twitterauth = require('../twitter');
const jwt = require('jsonwebtoken');
const config = require('../config');
const mail = require('../emailconfig');
const secret = config.token_secret;


router.use('/notes', require('./notes'));

// route for checking jade-babel es6
router.get('/checking',(req,res)=>{
    res.render('babelcheck.jade',{
        pagetitle:'babelcheck'
    });
});

// google authentication
router.get('/auth/google', googleauth.authenticate('google',
    {
        scope: ['profile', 'email']
    }
));

router.get('/auth/google/callback', googleauth.authenticate('google', {
    failureRedirect: '/signup'
}), (req, res) => {
    req.sessionid.user = req.user;
    res.redirect('/notes');
});

// facebook authentication
router.get('/auth/facebook', fbauth.authenticate('facebook', {
    scope: ['email']
}));

router.get('/auth/facebook/callback', fbauth.authenticate('facebook', {
    failureRedirect: '/signup'
}), (req, res) => {
    req.sessionid.user = req.user;
    res.redirect('/notes');
});

// twitter authentication
router.get('/auth/twitter', twitterauth.authenticate('twitter', {
    scope: ['email']
}));

router.get('/auth/twitter/callback', twitterauth.authenticate('twitter', {
    failureRedirect: '/signup'
}), (req, res) => {
    req.sessionid.user = req.user;
    res.redirect('/notes');
});

// home route
router.get('/', (req, res) => {
    res.render('home.jade', {
        pagetitle: "Home"
    });
});

// signup
router.get('/signup', (req, res) => {
    res.render('signup.jade', {
        pagetitle: "Register"
    });
});

// singup post 
router.post('/signup', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    // sanitize the form fields sent 
    // check if user exists with same username
    // check if user exists with same email 
    // password validation to be performed
    // other checks too.
    // increase the salt threshold from 12 to 13-15
    bcrypt.genSalt(12, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) throw err;
            password = hash;
            db.query('insert into user(username,password,email,email_verified) values(?,?,?,?)', [username, password, email, false], (error, rows) => {
                if (error) throw error;
                var userid = rows.insertId;
                // fetching new user 
                db.query('select * from user where id = ?', [userid], (error, rows) => {
                    if (error) throw error;

                    var user = rows[0];
                    delete user.password;

                    // for email verification token
                    // for additional security encrypt the token to prevent others from seeing the jwt claims i.e user data 
                    jwt.sign(user, secret, {
                        expiresIn: '1h'
                    }, (error, token) => {

                        var link = "http://localhost:3000/emailVerify/" + token;

                        var mail_options = {
                            from: 'Notes',
                            to: 'siddheshrane24@gmail.com',
                            subject: 'Email Verification',
                            text: 'Hey please click on the link to verify email',
                            html: "<a href=" + link + ">Click here to verify email</a>"
                        }

                        mail.sendMail(mail_options, (error, info) => {
                            if (error) throw error;
                            res.send('Email verification sent !Please complete the signup process by verifying your email sent to your inbox!');
                            res.end();
                            /* delete user.password;
                             req.sessionid.user = user;
                             res.redirect('/notes');
                            */
                        });
                    });
                });
            });
        });
    });
});

router.get('/emailVerify/:token', (req, res) => {

    var token = req.params.token;

    if (token) {

        jwt.verify(token, secret, (error, dt) => {

            // other checks to be performed here --> like redirect user if token error or other error 
            if (error) {
                res.send(error);
                res.end();
                return;
            }

            var userid = dt.id;

            db.query('update user set email_verified=? where id=?', [true, userid], (error, row) => {
                if (error) throw error;
                res.send('Email verified successfully!');
                res.end();
            });
        });

    } else {
        res.send('No email verification token found!!');
        res.end();
    }
});

// login 
router.get('/login', (req, res) => {
    res.render('login.jade', {
        pagetitle: "Login"
    });
});

// login post 
router.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    db.query('select * from user where username = ?', [username], (error, rows) => {
        if (error) throw err;
        if (rows.length === 0) {
            res.send('No user found');
            res.end();
            return;
        } else {
            var user = rows[0];
            // this compare method returns a boolean ==> true if the password is correct or else false 
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) throw err;
                if (!result) {
                    res.send('Passwords dont match');
                    return;
                } else {
                    console.log(user);
                    delete user.password;
                    req.sessionid.user = user;
                    console.log('user logged in successfully');
                    res.redirect('/notes');
                }
            });
        }
    });
});

// forgot password
router.get('/forgot', (req, res) => {
    res.render('forgot', {
        pagetitle: 'Forgot Password'
    });
});

// forgot password post 
router.post('/forgot', (req, res) => {

    var email = req.body.useremail;

    db.query('select * from user where email = ?', [email], (error, row) => {

        if (error) throw error;
        // read the article on forgot password implementation the big article which tells us not to show..no user found msg
        // refer it
        if (row.length == 0) {
            res.send('No user found with that email Address!');
            res.end();
            return;
        }
        if (row.length > 1) {
            res.send('Some wierd error');
            return;
        }

        var user = row[0];
        delete user.password;

        // encrypt ==> same reason ==>above
        jwt.sign(user, secret, {
            expiresIn: '1h'
        }, (error, token) => {

            var link = "http://localhost:3000/reset/" + token;

            var mail_options = {
                from: 'Notes',
                to: 'siddheshrane24@gmail.com',
                subject: 'Forgot password',
                text: 'Hey please click on the link to reset the password',
                html: "<a href=" + link + ">Click here to reset the password</a>"
            }

            mail.sendMail(mail_options, (error, info) => {
                if (error) throw error;
                res.send('Email sent!');
                res.end();
            });
        });

    });
});

// while performing password reset --> once the token is used to reset the password
// then it should automatically be blacklisted
// inshort --> one token, one reset 
// in current implementation => one token can reset password many times until token expires which is 1hr
// encryption is must to prevent showing of user data or claims 

// reset token check
router.get('/reset/:token', (req, res) => {

    var token = req.params.token;

    if (token) {

        jwt.verify(token, secret, (error, dt) => {

            // other checks to be performed here --> like redirect user if token error or other error 
            if (error) {
                res.send(error);
                res.end();
                return;
            }
            res.render('reset', {
                pagetitle: 'Reset Password',
                userid: dt.id
            });

        });

    } else {
        res.redirect('/forgot');
    }
});

// reset password post
router.post('/reset', (req, res) => {
    // use express validator here -> for validation and sanitizing the input    
    var pass1 = req.body.pass;
    var pass2 = req.body.pass2;
    var userid = req.body.userid;

    if (pass1 !== pass2) {
        res.status(404);
        res.end();
    } else {
        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(pass1, salt, function (err, hash) {
                if (err) throw err;
                pass1 = hash;
                db.query('update user set password=? where id = ?', [pass1, userid], (error, row) => {
                    if (error) throw error;
                    res.status(200);
                    res.end();
                    return;
                });
            });
        });
    }
});

// little validation n checks to be performed
module.exports = router;
