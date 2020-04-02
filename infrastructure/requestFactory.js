let HttpService = require('./http');
let { ResponseError,InnerError } = require('./exception');
let Logger = require('./logger');
let config = require('../config/index');
let remoteUrl = config('httpBaseUrl');
let logger = config('logger');

/**
 * 统一请求远程数据，支持test
 */
class RequestFactory {
  constructor(api){
    this.api = api
  }
  /**
   * 添加token到头部，请求service数据
   * @param postData
   * @returns {Promise<void>}
   * @private
   */
  static async _getData(api,postData,onSuccess) {
    let tempInfo = postData._tempInfo || {};
    tempInfo.remote_url = remoteUrl + api.remote_url
    try {
      if( api.test && (process.env.NODE_ENV !== 'production') ){
        return new Promise(function (resolve,reject) {
          setTimeout(function () {
            let res = api.test.res
            if(onSuccess){
              res = onSuccess(res)
            }
            // console.log('-- requestFactory --')
            // console.log(res)
            //兼容getData方法
            res = {
              data:res
            };
            if(api.test.status === 200){
              resolve(res)
            }else {
              reject(res)
            }
          },2000)
        })
      }
      let method = api.method.toLowerCase();
      let httpOpt = api.httpOpt;
      console.log('------------- requestFactory -------------')
      console.log(postData);
      let header = ( api.getHeader ? api.getHeader(postData.data) : {}) || {};
      console.log(header)
      httpOpt = Object.assign(httpOpt,{
        url:api.remote_url,
        method:method,
        data: postData,  //{ data:xxx, _tempInfo:xxx }
        headers:header
      });


      let res = await HttpService.request(httpOpt).then((res)=>{
        if(onSuccess){
          res = onSuccess(res)
        }
        return res
      });

      //
      // console.log('------- _getData get response -------------')
      // console.log(res)
      //个别接口会多返回一个projectId的字段
      if(res.projectId){
        res = res.data
      }
      if(logger){
	      await Logger.addResponseLog(tempInfo,res)
      }


      return res
    }catch (e) {
      //ResponseError 只应该有HTTPS模块来返回
      //其他的作为InnerError
      console.log('--------- _getData catch error ----------')
      //console.log(e);
      console.log(api.remote_url);
      console.log(postData.data)
      e._tempInfo = tempInfo;
      throw e
    }
  }

  /**
   * 获取service response with header and config
   * @returns {Promise<void>}
   */
  async getWholeData(postData,onSuccess){
    return RequestFactory._getData(this.api,postData,onSuccess)
  }

  async getData(postData,onSuccess){
    return RequestFactory._getData(this.api,postData,onSuccess).then((data)=>{
      return data.data
    })
  }

  /**
   * 获取service数据
   * @param postData
   * @returns {Promise<*>}
   */
  // async getData(postData,onSuccess){
  //   postData = postData || {}
  //   if(this.api instanceof Api){
  //     return RequestFactory._getData(this.api,postData,onSuccess)
  //       //.then((data)=>{ return data.data })
  //   }
  //   if(this.api instanceof ApiCollection){
  //     let r = [];
  //
  //     for(let i=0;i<this.api.pipe.length;i++){
  //       let t = this.api.pipe[i]
  //       if(t.params){
  //         postData = t.params(postData,r)
  //       }
  //       let p = t.api.map((v)=>{
  //         return RequestFactory._getData(v,postData)
  //       })
  //
  //       r[i] = await function(){
  //         return Promise.all(p)
  //       }
  //     }
  //     let final = r[r.length - 1]
  //     if(this.api.onComplete){
  //       final = this.api.onComplete(final)
  //     }
  //     return final
  //   }
  // }
}

module.exports = RequestFactory
