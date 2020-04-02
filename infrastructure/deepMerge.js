//extend属性和方法，如果有键值名相同的方法就是按照传入的先后顺序执行
import _isPlainObject from "lodash/isPlainObject";
import _isFunction from "lodash/isFunction";
import { isArray } from './utils'
import {after, before ,isKeyValue} from "./utils";
import { InnerError } from './exception'

/**
 * 验证option是否正确，递归对象属性
 * @param option
 * @returns {boolean}
 */
export function validateModeOption(option) {
  let availableMode = ['cover','after','before'];
  if(typeof option === 'string' && availableMode.indexOf(option) < 0){
    return false
  }
  Object.keys(option).forEach(function(key) {
    let value = option[key]
    if(isKeyValue(value)){
      validateModeOption(value)
    }
    if(typeof value !== 'string' || availableMode.indexOf(value) < 0){
      return false
    }
  });
  return true
}

function getMode(mode,key) {
  if(typeof mode === 'string'){
    return mode
  }else {
    return mode[key] || 'cover'
  }
}

function merge(source,target, option = {}) {
  source = source || {}
  let mode = option.mode || {}
  Object.keys(target).forEach(function(key) {
    let t = target[key]
    let s = source[key]
    let m = getMode(mode,key)



    let t_function = _isFunction(t)
    let s_function = _isFunction(s)
    let t_array = isArray(t)
    let s_array = isArray(s)
    let t_obj = isKeyValue(t)
    let s_obj = isKeyValue(s)

    let isFunctionMatch = t_function === s_function
    let isArrayMatch = t_array === s_array
    let isObjMatch = t_obj === s_obj

    // //if(key === 'bd'){
    // console.log('-------------')
    //   console.log(key)
    // console.log(t)
    // console.log(s)
    //   console.log(m)
    // console.log(mode)
    // // console.log('t_function '+t_function)
    // // console.log('s_function '+s_function)
    // // console.log('t_array '+t_array)
    // // console.log('s_array '+s_array)
    // //
    // // console.log('isObjMatch '+isObjMatch)
    // //   console.log('isObjMatch '+isObjMatch)
    // // console.log('isFunctionMatch '+isFunctionMatch)
    // // console.log('isArrayMatch '+isArrayMatch)
    //
    // //}


    if(isFunctionMatch && s_function){
      if(m === 'cover'){
        source[key] = t
      }
      else if(m === 'after'){
        source[key] = after(s,t)
      }
      else if(m === 'before'){
        source[key] = before(s,t)
      }
      else {
        source[key] = t
      }
    }
    else if(isArrayMatch && s_array){
      //console.log(s)
      source[key] = s.concat(t)
    }
    else if(isObjMatch && s_obj){
      //console.log('-------- isObjMatch ---------')
      let opt = Object.assign({},option,{ mode:m })
      merge(s,t,opt)
    }
    else {
      source[key] = t
    }
  })
  return source
}

export function deepMerge(source, target, option) {
  if(!isKeyValue(source) || !isKeyValue(target)){
    throw new InnerError({ message:'deepMerge error: required object type' })
  }
  source = Object.assign({},source)
  if(!_isPlainObject(target)){
    target = Object.assign({},target)
  }
  option = option || { }
  option = Object.assign({},{ mode:'cover' },option)
  if(option.mode){
    let t = validateModeOption(option.mode)
    if(!t){
      throw new InnerError({ message:'deepMerge error: option.mode is invalid' })
    }
  }
  let args = [source,target];
  let final = Object.assign({},source)

  final = merge(source,target,option)

  return final;
}
