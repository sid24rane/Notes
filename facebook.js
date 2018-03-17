const db = require('./db');
const config = require('./config');
const passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: config.facebook.client_id,
    clientSecret: config.facebook.client_secret,
    callbackURL: config.facebook.callback_url,
  profileFields: ['id', 'displayName', 'photos', 'email']
},
    function (accessToken, refreshToken, profile, done) {

        console.log(profile);

        var id = profile.id;

        db.query('select * from fbuser where social_id = ?',[id],(error,result)=>{
            
            if(result.length == 0){

                console.log(profile);

                var name = profile.displayName;

                if(profile.emails){
                var email = profile.emails[0].value;
                }else{
                    var email = '';
                }
                
                var token = accessToken;

                db.query('insert into fbuser(social_id,name,email,token) values(?,?,?,?)',[id,name,email,token],(error,rows)=>{
                        if(error){
                            return done(error);
                        }else{

                            var userid = rows.insertId;

                            db.query('select * from fbuser where id = ?',[userid],(error,rows)=>{
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