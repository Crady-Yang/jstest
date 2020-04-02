const { InnerError } = require('../../infrastructure/exception')

class PageServiceError extends InnerError{
  constructor(msg){
    msg = 'PageService Error:' + msg
    super({ message:msg })
  }
}

class PageService {
  constructor(opt){
      if (!opt.module || opt.module.length === 0){
          throw new PageServiceError('module is required')
    }
      if (!opt.page || opt.page.length === 0){
          throw new PageServiceError('page is required')
    }
      this.module = opt.module;
      this.page = opt.page;
      this.ifSchool = opt.ifSchool;
      this.ifCollege = opt.ifCollege;
      this.name = opt.name;
  }
}

class PageFactory {
  static create(opt){
    return new PageService(opt)
  }
}

exports.PageService = PageService
exports.PageFactory = PageFactory
