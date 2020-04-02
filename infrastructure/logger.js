let Mysql = require('../dataBase/mysql')
let config = require('../config/index')
let successCode = config('successCode')
let CircularJSON = require('circular-json');


/**
 * sql记录用户请求，前台报错，未捕获错误由text文件记录
 * 全局单例，服务启动时注册
 */
class Logger {

  static get logType(){
    return {
      request:'request',
      response:'response',
      exception:'exception'
    }
  }

  /**
   * 记录返回的数据
   * @param tempInfo
   * @param res
   */
  static addResponseLog(tempInfo,res){
    if(!tempInfo){
      return false
    }
    tempInfo = Object.assign({
      userId:'unknown user',
      isSystem:'unknown user',
      tk:'unknown user'
    },tempInfo)

    let message = ''
    if(res.status === 200 && res.data && res.data.code === successCode){
      message = 'success'
    }else {
      message = 'fail'
    }
    let Content
    try {
      Content = JSON.stringify(res.data)
    }catch (e) {
      Content = res.data
    }
    let value = {
      UserId:tempInfo.userId,
      IpAddress:tempInfo.ip,
      Type:Logger.logType.response,
      NodeUrl:tempInfo.nodeUrl,
      RemoteUrl:res.config.url,
      RequestUid:tempInfo.uuid,
      Content,
      Message:message
    }
    return Mysql.addLog(value)
  }

  /**
   * 记录远程请求
   * @param req   http.js request intercept的config参数
   * @param tempInfo 参数在 route/api/auth.js中添加
   * @returns {*}
   */
  static addRequestLog(tempInfo,req){
    tempInfo = tempInfo || {}
    tempInfo = Object.assign({
      userId:'unknown user',
      isSystem:'unknown user',
      tk:'unknown user'
    },tempInfo);

    //console.log('-------- addRequestLog ----------')

    let baseUrl = req.baseURL;
    let url = req.url;
    let remoteUrl = baseUrl + url;
    let value = {
      UserId:tempInfo.userId,
      IpAddress:tempInfo.ip,
      Type:Logger.logType.request,
      NodeUrl:tempInfo.nodeUrl,
      RemoteUrl:remoteUrl,
      RequestUid:tempInfo.uuid,
      Content:CircularJSON.stringify(req),
      Message:''
    };
    console.log(req);
    // console.log('--------- addRequestLog --------');
    // console.log(value);
    return Mysql.addLog(value)
  }

  /**
   * 加入exception日志
   * @param tempInfo
   * @param e  exception class
   * @returns {*}
   */
  static addExceptionLog(tempInfo,e){
    console.log('---------- addExceptionLog ------------')
    if(!tempInfo){
      return false
    }
    tempInfo = Object.assign({
      userId:'unknown user',
      isSystem:'unknown user',
      tk:'unknown user'
    },tempInfo);

    let value = {
      UserId:tempInfo.userId,
      IpAddress:tempInfo.ip,
      Type:Logger.logType.exception,
      NodeUrl:tempInfo.nodeUrl,
      RemoteUrl:tempInfo.remote_url,
      RequestUid:tempInfo.uuid,
      Content:e.stack,
      Message:e.name
    };
    return Mysql.addLog(value)
  }


}

module.exports = Logger
