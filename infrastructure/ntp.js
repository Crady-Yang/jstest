let Sntp = require('sntp');
let config = require('../config/index');
let ntpOptList = config('ntp')
let { from } = require('rxjs')
let Exception = require('./exception')

function getStamp(time){
    let now = new Date;
    let utc_timestamp = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,
    now.getHours(), now.getMinutes(), now.getSeconds(),now.getMilliseconds())+time.t;
    return utc_timestamp;
}

async function getNtp(count){
    try
    {
        let time = await Sntp.time(ntpOptList[count]);
        return time
    }
    catch (error)
    {
        //console.log(error);

        let n_count = count + 1
        if(ntpOptList[n_count]){
            return getNtp(n_count)
        }else {
            return new Exception.InnerError({ message:'NTP service error' })
        }
    }
}

async function getUTCtime() {
    let time = await getNtp(0);
    let utc_timestamp = getStamp(time);
    return utc_timestamp;
}

module.exports = getUTCtime
