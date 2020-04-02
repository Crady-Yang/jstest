let Sntp = require('sntp');
let OTPAuth = require('otpauth');
let Exception = require('./exception')
let config = require('../config/index');
let appSecret = config('appSecret');
let ntp = require('./ntp')
let totpOpt = config('totpConfig')
let appId = config('appId')
let defaultOpt = {
    algorithm: 'SHA512',
    digits: 6,
    period: 60,
    secret:OTPAuth.Secret.fromB32(appSecret)
};
let finalOpt = Object.assign({},defaultOpt,totpOpt);


class TotpService{
    static async _getTotpToken() {
        let utc_timestamp = await ntp()
        let opt = Object.assign(finalOpt,{
            timestamp:utc_timestamp
        })
        let totp = new OTPAuth.TOTP(opt);
        let token = totp.generate();
        return token

    }

    static async generate(){
        let token = await TotpService._getTotpToken();
        let load = {
            appId:appId,
            token:token
        }

        let load_string = JSON.stringify(load)
        //console.log(load_string);
        let encoding_base64 = Buffer.from(load_string).toString('base64');
        return encoding_base64
    }
}



module.exports = TotpService


