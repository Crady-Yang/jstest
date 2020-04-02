//let { ResponseError,ResponseError1,InnerError } = require('./exception');
let config = require('../config/index');
//let Utils = require('./utils');
// let config = require('../config');
//
// console.log('---- EX ----');
// console.log(ResponseError1);
// console.log(new ResponseError1({}));
// //
// console.log('---- config ----');
// console.log(config);
// //
// let successCode = config('successCode');
//let successCode = 0;



/**
 * 处理code=-1的为500状态，200状态都是成功的情况
 * 用于返回前台数据
 * @class ResponseHandler
 */
class ResponseHandler{
  constructor(type,data){
    if(!type){
      throw new InnerError({ message: 'type is required in ResponseHandler' })
    }
    // TODO 在编译阶段无法获取到 exception和config
	  let { ResponseError,InnerError } = require('./exception');
	  let config = require('../config/index');
	  let successCode = config('successCode');
    if(type === 'success'){
      data = data || { code:successCode,data:'',message:'success' };
      //status 200 但是失败的情况
      if(String(data.code) !== String(successCode) ){
        console.log('------------ status 200 但是失败的情况 ----------')
        console.log(data);
        throw new ResponseError({
          message:data.message,
          data:data.data
        })
      }
      return {
        code: successCode, //2018.9.7 doris 成功的情况统一回给前台successCode
        data:data.data,
        message:data.message,
      }
    }
    if(type === 'fail'){
      console.log('----------- ResponseHandler fail -----------')
      console.log(data);
      let message = 'something error'
      if(data && data.message){
        message = data.message
      }
      data = data || new ResponseError({ message:message })

      return {
        code:data.code,
        data:data.data,
        message:data.message
      }
    }
  }
}

module.exports = ResponseHandler
