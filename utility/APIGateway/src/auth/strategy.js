const passport = require('passport');
const passportJwt = require('passport-jwt');

const db = require('../db');

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = require('../config').jwt.secretOrKey;

var strategy = new JwtStrategy(jwtOptions,(jwt_payload,done)=>{
    console.log("jwt payload..."+JSON.stringify(jwt_payload));


    (async () => {

        try {
                const User = db.get('User');

                const user = await User.findOne({id:jwt_payload.userId});
                
                if(user.userId){
                    return done(null,user.userId);
                }else{
                    return done(null,false);
                }
            
        } catch (err) {
            return done(null,false);
        }

    })();


});

passport.use(strategy);



module.exports = passport