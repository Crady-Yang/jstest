import { parseResponse, parseRequest, parseScript, validateRequest } from './httpHelper';
import { ErrorNotification,Notification } from '../component/notification';
import { ErrorMessageCenter } from '../common/errorMessageCenter'
import { createGuid } from '../common/utils'
import { Config } from './config'


const localInstance = axios.create({
  baseURL: '/',
  timeout: 1200000, //20min
  validateStatus: (status) => {
    return true; // 使得500的错误也能获取值
    },
});

function parseResponseCase(data) {
  // 只转第一层
  let final = {};
  for(let k in data){
    final = {
      data:data.Data,
      error:data.Error,
      errorCode:data.ErrorCode,
      errorMessage:data.ErrorMessage,
      responseTimeStamp:data.ResponseTimeStamp,
      traceId:data.TraceId
    }
  }
  return final
}


export class HttpService {

  /**
   * HttpService constructor
   * @param api
   * @param opt.successNotification 成功显示的通知内容
   * @param opt.errorNotification 失败显示的通知内容
   */
  constructor(api,opt){
    opt = opt || {};
    this.api = api;
    this.ifCommand=opt.ifCommand||false;
    let successNotification = this.api.type !== 'read';
    this.opt = Object.assign({
      successNotification,
      errorNotification:true
    },opt);
  }

  /**
   *
   * @param data  传给后台的值
   * @returns {*}
   */
  request(data) {
    let reqDto = this.api.reqDto;
    let resDto = this.api.resDto;
    let instance,url,method,params,
      responseType = this.api.responseType;

    data = parseScript(data, this.api.ifFilterScript);

    console.log('------ parseScript -----');
    console.log(data);

    data = parseRequest(data,reqDto);

    console.log('------ parseRequest -----');
    console.log(data);
    instance = localInstance;
    url = this.api.url;
    method = this.api.method;
      let dataKey = (method === 'post' || method === 'put' || method === 'patch') ? 'data' : 'params';
    params = {
        [dataKey]: data,
        headers: {
            'Authorization': `Bearer ${store.get('access_token')}`
        }
      };
    let option = Object.assign({
      url,
      method,
      responseType
    }, params);
      console.log("option---------------------------------------------------")
      console.log(option)
    return instance.request(option)
      // 全局消息通知 数据转换
        .then((res) => {
            console.log('-------res-----------')
            console.log(res);
            if (res.status === 401) {
                window.location.href="/admin/login"
            }
            let data = res.data || res;
            if(this.api.responseType === 'blob'){
              return data
            }
            if (data.error === false) {
                let t = data.data;
                if(this.api.type === 'read' && t){
                // grid 的数据时能够正常转换数据
                if(t.total !== undefined && t.data !== undefined){
                    t.data = parseResponse(t.data,resDto);
                }else {
                    t = parseResponse(t,resDto);
                }
                }
                let successNotification = this.opt.successNotification;
                let text = `操作成功`;
                if(successNotification){
                if(typeof successNotification === 'string'){
                    text = successNotification;
                }
                    Notification.show(text, 'success')
                }
                return t;
            } else {
                let errorNotification =  this.opt.errorNotification;
                let title = `请求失败`;
                let message = data.errorMessage || data.data || '接口发生错误';
                let traceId = data.traceId;
                let errorTime = moment(data.responseTimeStamp).format('YYYY-MM-DD HH:mm:ss');
                let errorId = createGuid();
            
                //ErrorMessageCenter.add({
                //  id:errorId,
                //  title,
                //  message,
                //  traceId
                //});
                if(errorNotification){
                if(typeof errorNotification === 'string'){
                    message = errorNotification;
                }
                ErrorNotification.error({
                    title,
                    message,
                    errorId,
                    traceId,
                    errorTime
                },'error');
                }
                return Promise.reject(data);
            }
        }).catch(function (error) {
            console.log('----------error-----------')
            console.log(error);
            return Promise.reject(error);
            //console.log(error);
        })
  }
}

