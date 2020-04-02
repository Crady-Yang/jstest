import {scriptFilter, timeTFormatter, trimFilter,isJson,isArray} from "./utils";

/**
 * 验证单个field的值
 * @param value 单个filed的值
 * @param rules 这个field的规则集合
 * @returns {boolean}
 */
export function validateSchemaValue(value,rules) {
  let ruleCollection = {
    require:function (val) {
      return !(val === undefined || val === null)
    },
    min:function (val) {
      if(typeof val === 'number'){
        return val > rules.max
      }else {
        return true
      }
    },
    max:function (val) {
      if(typeof val === 'number'){
        return val < rules.max
      }else {
        return true
      }
    },
    pattern:function (val) {
      return new RegExp(rules.pattern).test(val);
    }
  };
  let ifCorrect = true;
  for(let k in rules){
    let f = ruleCollection[k];
    if( f && !f(value) ){
      ifCorrect = false;
      break;
    }
  }
  return ifCorrect
}

/**
 * 对于schema的type为boolean的数据做转换
 * @param value
 * @returns {boolean}
 */
export function parseBoolean(value) {
  if(value === '0' || value ==='null' || value === 'false' || value === 'undefined'){
    return false
  }
  return Boolean(value)
}

/**
 * 转换response中的时间，对象递归转换
 * @param data
 * @param dto
 * @returns {*}
 */
function parseResponseObject(data,dto) {
  let finalData = data;
  if(!dto){
    return data
  }
	if(typeof data === 'object' && dto){
    finalData = {};
		for(let k in data){
			let val = data[k];
			let field = dto[k];
			let finalVal = data[k];
			if(typeof val === 'object' && field){
				finalVal = parseResponse(val,field);
			}else if(field) {
				if(field.type === 'date'){
					// +8 小时
					finalVal = timeTFormatter(val).toString();
				}
				if(field.type === 'boolean'){
					finalVal = parseBoolean(val)
				}
			}
			finalData[k] = finalVal
		}
	}
	return finalData
}

/**
 * 转换response数组中的时间，对象递归转换
 * @param data
 * @param dto
 * @returns {*}
 */
export function parseResponse(data,dto){
  if(isArray(data)){
    let t = data.map((v)=>{
      let temp = parseResponseObject(v,dto);
      return temp;
    });
    return t;
  }else if(isJson(data)){
	  return parseResponseObject(data,dto)
  }else {
    return data;
  }
}


/**
 * 验证传过去的数据是否符合schema
 * @param data
 * @param dto
 * @returns {boolean}
 */
export function validateRequest(data,dto){
  if(typeof data === 'object' && dto){
    for(let k in data){
      let val = data[k];
      let field = dto[k] || {};
      let validation = field.validation
      if(typeof val === 'object' && validation){
        if(!validateRequest(val,field)){
          return false
        }
      }else if(validation) {
        if(!validateSchemaValue(val,validation)){
          return false
        }
      }
    }
  }
  return true
}

/**
 * 转换传到后台接口的数据
 * @param data
 * @param dto
 * @returns {*}
 */
export function parseRequest(data,dto){
  dto = dto || {};

  if(_.isArray(data)){
    return data.map((v)=>{
      return parseRequest(v,dto)
    })
  }else if(_.isPlainObject(data)){
    for(let k in data){
      let val = data[k];
      let field = dto[k];

      if(_.isDate(val)){
        data[k] = moment(val).format('YYYY-MM-DD HH:mm:ss')
      }else if(typeof val === 'object' && field){
        val = parseRequest(val,field);
      }else if(field) {
        // if(field.type === 'date'){
        //   data[k] = moment(val).format('YYYY-MM-DD HH:mm:ss')
        // }
        if(field.type === 'boolean'){
          data[k] = parseBoolean(val)
        }
      }
    }
  }else {
    return data
  }

  return data
}

/**
 * 对传到后台接口的数据过去标签和首尾空格
 * @param value
 * @param ifFilterScript
 * @returns {*}
 */
export function parseScript(value, ifFilterScript) {
  if (typeof value !== 'string') {
    return value
  }
  if(_.isArray(value)){
    return value.map((v)=>{
      return parseScript(v,ifFilterScript)
    })
  }else if(_.isPlainObject(value)){
    let final = {}
    for (let k in value) {
      let v = value[k]
      v = trimFilter(v)
      if (ifFilterScript) {
        v = scriptFilter(v)
      }
      final[k] = v
    }
    return final
  }else if(_.isString(value)){
    let t = trimFilter(value)
    if (ifFilterScript) {
      t = scriptFilter(t, null)
    }
    return t
  }else {
    return value
  }

}
