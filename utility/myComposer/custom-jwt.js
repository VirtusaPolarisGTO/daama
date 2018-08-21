const passportJwt = require('passport-jwt');
const util = require('util');

function CustomJwtStrategy(options, verify) {
  options.jwtFromRequest = passportJwt.ExtractJwt.fromUrlQueryParameter("token");
  passportJwt.Strategy.call(this, options, verify);
}

util.inherits(CustomJwtStrategy, passportJwt.Strategy);

module.exports = {
  Strategy: CustomJwtStrategy
};