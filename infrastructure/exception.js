let ErrorCode = require('./exception.code');
let defaultSettings = {
    message:'an error occurred',
    ifCustom:true
};



/**
 * Basic exception
 */
class Exception extends Error{
    /**
     * create custom error with different type
     * @param opt
     */
    constructor(opt){
      let message = opt.message || 'some thing error';
      super(message);
      this.name = this.constructor.name;
      this.code = opt.code;
      this.data = opt.data;
      //opt 是error实例的时候
	    if (typeof Error.captureStackTrace === 'function') {
		    Error.captureStackTrace(this, this.constructor);
	    } else {
		    this.stack = (new Error(message)).stack;
	    }
    }
}


class InnerError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['InnerError']
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings)
    super(settings)
  }
}

/**
 * 请求参数错误
 */
class ParametersError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['ParametersError']
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings)
    super(settings)
  }
}

/**
 * server 返回错误
 */
class ResponseError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['ResponseError'];
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings);
    super(settings)
  }
}


/*
 * 返回page资源的过程中出错
 */
class PageError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['ResponseError']
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings)
    super(settings)
  }
}

/**
 * 请求非法资源
 */
class PermissionError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['PermissionError']
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings)
    super(settings)
  }
}

/**
 * 用户登录超时错误
 */
class ExpireError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['ExpireError']
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings)
    super(settings)
  }
}

/**
 * 数据库错误
 */
class SqlError extends Exception{
  constructor(settings){
    let errorContent = ErrorCode['SqlError']
    settings = settings || {};
    settings = Object.assign(defaultSettings,errorContent,settings)
    super(settings)
  }
}

exports.InnerError = InnerError;
exports.ParametersError = ParametersError;
exports.ResponseError = ResponseError;
exports.PermissionError = PermissionError;
exports.ExpireError = ExpireError;
exports.SqlError = SqlError;
exports.PageError = PageError;

// exports.InnerError = errorFactory('InnerError')
// exports.ParametersError = errorFactory('ParametersError')
// exports.ResponseError = errorFactory('ResponseError')
// exports.PermissionError = errorFactory('PermissionError')
// exports.ExpireError = errorFactory('ExpireError')
// exports.SqlError = errorFactory('SqlError')
