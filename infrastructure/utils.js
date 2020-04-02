let { ResponseError } = require('./exception')
let config = require('../config')
let successCode = config('successCode')
let _isFunction = require('lodash/isFunction');
let _isArray = require('lodash/isArray')
let _indexOf = require('lodash/indexOf')
let _filter = require('lodash/filter')
let _isPlainObject = require('lodash/isPlainObject')
let _isString = require('lodash/isString')



class Utils {
  /**
   * 处理后台返回的数据，获取data
   */
  static remoteResponseHelper(res){
    if(res.code !== successCode){
      throw new ResponseError({ message:res.message,data:res.data })
    }else {
      return res.data
    }
  }

  static getOwnProp(obj){
    let final = {};
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        final[key] = obj[key]
      }
    }
    return final;
  }

  static trimFilter(string) {
    if(typeof string !== 'string'){
      return string
    }
    //去除字符串右边的空格
    let j = string.length - 1;
    for (j; j >= 0 && string.charAt(j) <= " " ; j--) {
      ;
    };
    string = string.substring(0, j + 1);
    //去除字符串左边的空格
    let k = 0
    for (k; string.length && string.charAt(k) <= " " ; k++) {
      ;
    };
    string = string.substring(k, string.length);

    return string;
  }

  static scriptFilter(str,reg) {
    if(typeof str !== 'string'){
      return str
    }
    return str ? str.replace(reg || /[&<>](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function (a, b) {
      if (b) {
        return a;
      } else {
        return {
          '<': '&lt;',
          '&': '&amp;',
          //'"': '&quot;',
          '>': '&gt;',
          //"'": '&#39;',
        }[a]
      }
    }) : '';
  }

  static parseObjectScript(value,ifFilterScript){
    let final = {};
    for (let k in value) {
      let v = Utils.parseScript(value[k],ifFilterScript);
      final[k] = v
    }
    return final
  }

  static parseString(value,ifFilterScript){
    if(_isString(value)){
      let t = Utils.trimFilter(value);
      if (ifFilterScript) {
        t = Utils.scriptFilter(t, null)
      }
      return t
    }else {
      return value
    }
  }

  static parseArray(list,ifFilterScript){

    if(_isArray(list)){
      let t = list.map((v)=>{
        let temp = Utils.parseScript(v,ifFilterScript);
        console.log('------ parseArray -----');
        console.log(temp);
        return temp
      });
      return t;
    }else {
      return list
    }
  }

  static parseScript(value, ifFilterScript) {
    if (value === undefined || value === null || value === '') {
      return value
    }
    console.log('------- parseScript -----');
    console.log(value);
    console.log(`_isPlainObject  ${_isPlainObject(value)}`);
    console.log(`_isArray  ${_isArray(value)}`);

    if(_isArray(value)){
      console.log('------- parseScript Array -----');
      console.log(value);
      return Utils.parseArray(value,ifFilterScript)
    }else if(_isPlainObject(value)){
      console.log('------- parseScript _isPlainObject -----');
      console.log(value);
      return Utils.parseObjectScript(value,ifFilterScript)
    }else if(_isString(value)){
      return Utils.parseString(value,ifFilterScript)
    }
    return value;
  }

  static after(orgFn, addFn) {
    if (!_isFunction(orgFn)) {
      return orgFn;
    }
    if (_isFunction(addFn)) {
      return function (...arg) {
        let org = orgFn.apply(this, arg);
        arg = [org].concat(arg)
        //第一个参数是原来那个函数的返回值，第二个参数开始是原始参数
        let addFnData = addFn.apply(this,arg);
        //let finalData = Object.assign({}, org, addFnData);

        return addFnData;
      }
    } else {
      return orgFn;
    }
  }

  static before(orgFn, addFn) {
    if (!_isFunction(orgFn)) {
      return orgFn;
    }
    if (_isFunction(addFn)) {
      return function (...arg) {
        let addFnData = addFn.apply(this, arg);
        arg = [addFnData].concat(arg)
        let org = orgFn.apply(this,arg);
        //let finalData = Object.assign({}, org, addFnData);
        return org;
      }
    } else {
      return orgFn;
    }
  }

  static isKeyValue(obj) {
    if (typeof obj === 'object' && !_isArray(obj) && !_isFunction(obj) && obj !== null) {
      return true
    }
    return false
  }

  static isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

}


module.exports = Utils
