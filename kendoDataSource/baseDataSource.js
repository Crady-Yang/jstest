import { InnerError } from '../common/exception';
import { formatKendoGridParamData } from './filterHelper';
import { isJson } from '../common/utils';
import { validateModeOption,deepMerge } from '../common/deepMerge';
import { parseResponse } from '../common/httpHelper'

const _createKendoOption = Symbol('createKendoOption');
const _mergeFunction = Symbol('mergeFunction');

class BaseKendoDataSourceException extends InnerError{
  constructor(settings){
    settings.message = 'BaseKendoDataSource Error: ' + settings.message
    super(settings)
  }
}

/**
 * opt = kendo Option + mode + type
 * @param opt
 */
function defaultOpt(opt) {
  opt = opt || {};
  if(!_.isFunction(opt) && !isJson(opt)){
    throw new BaseKendoDataSourceException({ message:'opt should be object or function' })
  }
  //set default value
  opt = Object.assign({},{
    type:'list',
    mode:{
      schema:{
        data:'after',
        parse:'after',
        total:'after'
      },
      requestEnd:'after',
      requestStart:'after'
    }
  },opt);
  let availableType = ['list','data','local'];
  if(availableType.indexOf(opt.type) < 0 ){
    throw new BaseKendoDataSourceException({ message:'opt.type invalid' })
  }
  if(opt.mode && !validateModeOption(opt.mode)){
    throw new BaseKendoDataSourceException({ message:'opt.mode invalid' })
    }
  return opt
}

/**
 * 合并DataSource配置
 */
class BaseKendoDataSource {
  /**
   * 合成KendoDataSource配置对象
   * @param api
   * @param opt kendoDataSource的Option
   * @param opt.mode 选项合并方式，cover or after or before，对于function类型的options
   * @param opt.type type=list时，表示需要分页，自动加上servicePage，在schema.data中返回data字段的值，在schema.total中返回total的值
   */
  constructor(api,opt){
    if(new.target === 'BaseKendoDataSource'){
      throw new BaseKendoDataSourceException({ message:'BaseKendoDataSource can not be instanced' })
    }
    this.opt = defaultOpt(opt);
    this.api = api;
    this.option = this[_createKendoOption]();
    this.dataSource = null
  }

  /**
   *  可由子类重载
   *  list - 有page，filter，mode
   *  data - 有filter，mode
   *  local - 有model
   */
  defaultRemoteOption(){
    let that = this;
    let opt = this.opt;
    let fields = {};
    if(this.api.resDto){
      fields = this.api.resDto
    }
    let schema = {
      model:{ id:'id',fields }
    };
    let option = {
      schema
      };
    if(opt.type === 'list'){
      schema = {
        data:function (res) {
          // console.log('----------- Base dataSource list schema.data ---------')
          // console.log(that.api.name)
         // console.log(res)
          try {
            let resData = res.data||res.list||res;
            resData = parseResponse(resData,fields);
            console.log(resData);
            return  resData
          } catch (e) {
            return res
          }
        },
        total:function (res) {
          console.log('----------- Base dataSource list schema.total ---------')
          let t = res.total||res.length;
            console.log(t)
          return t
        },
        model:{
          id:'id',
          fields
        },
        parse:function (res) {
          console.log('----------- Base dataSource list schema.parse ---------')
          console.log(res.data)
          // { code:1, data:[], messaeg:'' }

          return res.data
        },
        error:function (res) {
          if(res.code !== 0){
            return res.message
          }
        }
      };
      option = {
        serverFiltering:true,
        serverPaging:true,
        page: 1,
        pageSize: 10,
        schema
      }
    }
    if(opt.type === 'data'){
      schema = {
          data: function (res) {
          try {
            let t = res.data || res;
            console.log(t);
            let resData = parseResponse(t,fields);
            console.log("------ parseResponse ------");
            console.log(resData);
            return resData
          }catch (e) {
            return res
          }
        },
        model:{
          id:'id',
          fields
        }
      };
      option = {
        serverFiltering:true,
        schema
      }
    }

    return option
  }
  onBeforeSend(xhr){
      xhr.setRequestHeader('Authorization', `Bearer ${store.get('access_token')}`);
  }
  /**
   * 更新查询参数
   */
    mergeQuery(data) {
    this.option.transport[this.api.type].data = data;
    this.dataSource = this.create();
    return this
  }

  [_mergeFunction](opt){
    let mode = opt.mode;
    let functionList = ['schema.data','schema.error','schema.groups','schema.aggregates','schema.parse','schema.total','requestEnd','requestStart']
  }

  /**
   * 根据api定义转换kendoDataSourceOption
   * @returns {*}
   */
  [_createKendoOption](){
    let opt = this.opt;
    let api = this.api;
    let url = api.url;
    let defaultOption = this.defaultRemoteOption(opt)

    let dataType = api.responseType || 'json';
    let type = api.remote ? api.method :'post';

    let apiType = api.type || 'read';
    let contentType=api.contentType||'application/json';
    let  beforeSend=this.onBeforeSend
    let transportOption = {
      url,
      type,
      dataType,
      contentType,
      beforeSend
    };
    let option = Object.assign(defaultOption,{
      transport:{
        [apiType]:transportOption,
        parameterMap: function (options, operation) {
          //console.log('--------- parameterMap -----------')
          if (operation === "read") {
            console.log(options);
            options = formatKendoGridParamData(options)
            //console.log(options)
          }
          return JSON.stringify(options);
        }
      }
    });

    if(_.isFunction(opt)){
      option.schema.parse = opt
    }else {
      option = deepMerge(option,opt,{ mode:opt.mode })
    }

    // option.requestStart = function(e){
    //   // console.log('---------- data source request start ---------');
    //   // console.log(e.sender)
    // };
    console.log('-------------- base dataSource option ----------------')
    console.log(option);
    // console.log(String(option.schema.data))
    // console.log(String(option.schema.total))
    // console.log(String(option.schema.parse))
    delete option.type;
    return option
  }

  /**
   * 合并其他kendoDataSource的选项
   * @param option
   */
  merge(option){
    let temp = deepMerge(this.option,option,{ mode:this.option.mode });
    this.option = temp;
    this.dataSource = this.create();
  }

  /**
   * 被子类实现，更新DataSource
   * 更新DataSource属性
   */
  create(){}
}

export default BaseKendoDataSource


