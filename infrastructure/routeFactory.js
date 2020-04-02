let ErrorHandler = require('./errorHandler');
let { ParametersError } = require('./exception');
let ResponseHandler = require('./response');
let Utils = require('./utils');
let validateDto = require('./paramsValidator');


async function f(req,res,next,api,dataFn) {
  try {

    let postData_data = req.body.data;
    let _tempInfo = req.body._tempInfo;
    let final = postData_data;

    if(api.nodeParse){
      final = api.nodeParse(postData_data);
    }
    if(api.ifFilterScript){
      final = Utils.parseScript(final,api.ifFilterScript);
    }
    if(api.reqDto){
      let error = validateDto(postData_data,api.reqDto);
      if(error){
        throw new ParametersError(error)
      }
    }

    let postData = {
      data:final,
      _tempInfo
    };

    let tk = req.cookies.tk;
    // 请求远程服务器
    let returnData = await dataFn(postData,tk);
    if(api.onSuccess){
      res = api.onSuccess(returnData,req,res)
    }
    console.log('---  RouterFactory  ----');
    console.log(api.node_url);
    //console.log(returnData)
    if(api.httpOpt.responseType === 'json'){
      res.type('json');
      let responseInstance = new ResponseHandler('success',returnData);
      res.status(200).send(responseInstance)
    }else {
      res.type('png');
      res.status(200).send(Buffer.from(returnData))
    }

  } catch (error) {
    console.log('--------- router factory error -------');
    console.log(error);
    ErrorHandler(error,req,res)
  }
}

/**
 * 统一route
 */
class RouterFactory {
  static create(router,api,dataFn){
    let method = api.method.toLowerCase();
    if(!api.node_url){ return }

    router.post(api.node_url, async function (req,res,next) {
      await f(req,res,next,api,dataFn)
    });
    return router
  }
}

module.exports = RouterFactory;
