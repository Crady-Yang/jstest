let jwtSimple = require('jwt-simple')

function decode(string,secret) {
  try{
    return jwtSimple.decode(string,secret)
  }catch (e) {
    console.log(e.name)
    if(e.name === 'Token not yet active'){
      return true
    }
  }
}

module.exports = decode
