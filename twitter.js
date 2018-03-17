const db = require('./db');
const config = require('./config');
const passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL
},
    function (accessToken, refreshToken, profile, done) {

        var id = profile.id;

        db.query('select * from twuser where social_id = ?',[id],(error,result)=>{
            
            if(result.length == 0){

                var name =  profile.displayName;
                if(profile.emails){
                var email = profile.emails[0].value;
                }else{
                    var email="";
                }
                var token = accessToken;

                db.query('insert into twuser(social_id,name,email,token) values(?,?,?,?)',[id,name,email,token],(error,rows)=>{
                        if(error){
                            return done(error);
                        }else{

                            var userid = rows.insertId;

                            db.query('select * from twuser where id = ?',[userid],(error,rows)=>{
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
       callback(null, user);
});

module.exports=passport;