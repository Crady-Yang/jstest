module.exports = {
    'PermissionError':{
        message:"permission error",
        code:'10004'
    },
    'ParamsError':{
        message:"miss required para and para type error",
        code:'10002'
    },
    'InnerError':{
        message:"code error",
        code:'10001'    //node service 内部错误
    },
    'ResponseError':{
        message:"service return error", //service 返回200 但是code ！= 0 或者返回500
        code:'10003'
    },
    'ExpireError':{
        message:"登录超时",
        code:'10005'
    },
    'SqlError':{
      message:"SqlError",
      code:'10006'
    }
}
