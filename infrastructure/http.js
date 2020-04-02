let axios = require('axios')
let config = require('../config/index');
let httpBaseUrl = config('httpBaseUrl');
let timeout = config('httpTimeout')
let ifTotpActice = config('ifTotpActive');
let successCode = config('successCode');
let TotpService = require('./totp');
let Logger = require('./logger');
let { ResponseError }  = require('./exception');
const https = require('https');

const instance = axios.create({
  baseURL: httpBaseUrl,
  timeout: timeout,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type':'application/json'
  }
});

// 转换后台返回的message，有时候message会返回一个对象
function getMessageParsedRes(response){
  try {
    response.data = response.data || {};
    let message = response.data.message;
    // message有嵌套的情况
    if(message && message.message){
      response.data.message = message.message;
    }
    if(response.data.Message){
      response.data.message = response.data.Message
    }
    return response
  }catch (e) {
    return  response
  }

}

instance.interceptors.request.use(async function (config) {
    // Do something before request is sent
    // add totp
    console.log('--------- request interceptors -------');
    console.log(config.headers);

    if(ifTotpActice){
      let authString = await TotpService.generate();
      config.headers = Object.assign({},config.headers,{
        'Auth-Appid':authString
      });
      console.log(`---------- Auth-Appid --------`);
	    console.log(authString)
    }


    let tempInfo = config.data._tempInfo;
    console.log('----------------- tempInfo ---------------');
    if(tempInfo){
      let tk = tempInfo.tk;
      // 登录的时候，有时候带着过期的token，导致登录失败，返回401
      if(config.ifAddToken !== false){
	      config.headers = Object.assign({},config.headers,{
		      'Authorization':'Bearer '+ tempInfo.tk
	      })
      }
      if(tempInfo.ip){
        config.headers.ipaddress = tempInfo.ip;
        console.log('ip address: '+tempInfo.ip)
      }
    }

    config.data = config.data.data;

  console.log('--------- http.js ----- node request url---------------- ')
  console.log(config.url)
  console.log(config.data)
  console.log(config.headers)


  // console.log(config.data)
  // console.log(config.data._tempInfo)
  // console.log(config.data._tempInfo.tk)
    //add token
    // console.log(config.data)
    // console.log(config.data._tempInfo)
    // console.log(config.data._tempInfo.tk)

    //异步操作

    //console.log(config)
   //console.log('--------- http.js ----- node request config---------------- ')
   //console.log(config.headers.Authoçrization)
    //console.log(config.url)
    //console.log(config.data)
    //console.log(config.headers)


    Logger.addRequestLog(tempInfo,config).then((sqlObj)=>{
      //console.log('----- log success -----')
    }).catch((error)=>{
      console.log('----- log error ------')
      console.log(error)
    });

    return config;

  }, async function (error) {
    // Do something with request error
    console.log('----- http.js -------- interceptors error-----------')
    console.log(error.name)
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Do something with response data
    // let tk = response.data.result;
    // if(tk){
    //   AuthService.setToken()
    // }
  console.log('--------- http.js ----- service response---------------- ')
  console.log(response.config.url);
  console.log(response.config.data);
  console.log(response.data);


  // try{
  //   let message = response.data.message.message;
  //   if(message){
  //     response.data.message = message
  //   }else if(!response.data.message && response.data.Message){
  //     response.data.message = response.data.Message
  //   }
  // }catch (e) {
  //
  // }


  //if(response.config){}
  //console.log(response.data)
  // if(response.data && response.data.code === successCode){
  //   return response
  // }else {
  //   throw new Error(response.data)
  // }
  // console.log('--------- http.js ----- service response status---------------- ')
  // console.log(response.status)
  // console.log('--------- http.js ----- service response data  ---------------- ')
  // console.log(response.data)



    return getMessageParsedRes(response);
  }, function (error) {
    // Do something with response error
    console.log('-------- http axio interceptors error-------------');
    console.log(error);
    console.log(error.response);
    let res = getMessageParsedRes(error.response);
    // console.log('------------ res.response ---------');
    // console.log(res.response);
    console.log('------------ res.data ---------');
    console.log(res);
    let message = (res && res.data) ? res.data.message : 'Service Response Error!';
    console.log(message);
    return Promise.reject(new ResponseError({message}));
  });


class HttpService{
    static get(url,parmas,opt){
      return instance.get(url,parmas,opt)
    }

    static request(config){
      return instance.request(config)
    }

    static post(url,parmas,opt){
      return instance.post(url,parmas,opt)
    }
}


module.exports = HttpService
