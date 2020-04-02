let defaultSettings = {
  message:'an error occurred',
  detail:'',
  ifFontEnd:true
};

/**
 * 前台的程序错误
 */
class Exception extends Error{
  /**
   * create custom error with different type
   * @param message
   */
  constructor(message){
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
    this.ifCustom = true
  }
}

/**
 * 代码编写错误 e.g 键值找不到，传入function的param类型不对，后台数据不符合约定等
 * 通常需要由程序员主动抛出
 * @class InnerError
 * @extends {Exception}
 */
class InnerError extends Exception{
  constructor(settings){
    settings = settings || {};
    settings = Object.assign(defaultSettings,{
      message:"code error"
    },settings)
    super(settings.message)
  }
}

/**
 * 业务场景警告等
 * @class BussionWarn
 * @extends {Exception}
 */
class BussionWarn extends Exception{
  constructor(settings){
    settings = settings || {};
    settings = Object.assign(defaultSettings,{
      message:"something warning"
    },settings)
    super(settings.message)
  }
}

exports.InnerError = InnerError;
exports.BussionWarn = BussionWarn;

