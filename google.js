const db = require('./db');
const config = require('./config');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: config.google.client_id,
    clientSecret: config.google.client_secret,
    callbackURL: config.google.callback_url
},
    function (accessToken, refreshToken, profile, done) {

        var id = profile.id;

        db.query('select * from googleuser where social_id = ?',[id],(error,result)=>{
            
            if(result.length == 0){
                var name = profile.displayName;
                var email = profile.emails[0].value;
                var token = accessToken;

                db.query('insert into googleuser(social_id,name,email,token) values(?,?,?,?)',[id,name,email,token],(error,rows)=>{
                        if(error){
                            return done(error);
                        }else{

                            var userid = rows.insertId;

                            db.query('select * from googleuser where id = ?',[userid],(error,rows)=>{
                                if(error){
                                    return done(error);
                                }else{
                                    var newuser = rows[0];
                                    
                                    return done(null,newuser);
                                }
                            });
                        }
                });
            }else{
                var user = result[0];
                done(null,user);
            }
        });
    }
));

passport.serializeUser(function(user, callback){
        callback(null, user);
});

passport.deserializeUser(function(user, callback){
       console.log('deserialize user.');
       callback(null, user);
});

module.exports=passport;