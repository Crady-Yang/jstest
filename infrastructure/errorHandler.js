let { ResponseError,PermissionError,PageError} = require('./exception');
let Response = require('./response');
let Logger = require('./logger');

function ifGetRoute(req){
  return req.method.toLowerCase() === 'get'
}

async function errorHandler(e,req,res) {
  // console.log('errorHandler--------------------')
  // console.log(e);
  let tempInfo = req.body._tempInfo || e._tempInfo
  await Logger.addExceptionLog(tempInfo,e);
  // console.log('------------ error type PermissionError --------------')
  // console.log(e instanceof PermissionError)
  // console.log(ifGetRoute(req))
  //请求了非法页面时，跳转到error页面
  if((e instanceof PermissionError || e instanceof PageError) && ifGetRoute(req)){
    //console.log('PermissionError-------------------')
    let orgPath = req.originalUrl
    res.redirect(`/#/signIn?redpath=${orgPath}`);
  }
  //service 返回的错误和未捕获的错误在返回给前台时都会被包装成ResponseError
  //前台获取的数据应该都是有code的
  if(!e.ifCustom){
    //wrapper to InnerError
    //TODO: 上线之后需要替换成内部错误
    e = new ResponseError({ message:e.message })
  }

  let responseInstance = new Response('fail',e );

  res.status(500).send(responseInstance)
}

module.exports = errorHandler
