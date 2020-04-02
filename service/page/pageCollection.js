const { PageFactory } = require('./pageService')


let PageCollection = {
    "user": PageFactory.create({
        name: "user",
        module: "rbac",
        page: "用户管理",
        ifSchool: false,
        ifCollege:false
    }), 
    "resource": PageFactory.create({
        name: "resource",
        module: "rbac",
        page: "资源管理",
        ifSchool: false,
        ifCollege: false
    }), 
    "menu": PageFactory.create({
        name: "menu",
        module: "rbac",
        page: "菜单管理",
        ifSchool: false,
        ifCollege: false
    }), 
    "role": PageFactory.create({
        name: "role",
        module: "rbac",
        page: "角色管理",
        ifSchool: true,
        ifCollege: false
    }), 
    "candidatelist": PageFactory.create({
        name:"candidateList",
        module: "复试管理",
        page: "考生管理",
        ifSchool: true,
        ifCollege: true
    }), 
    "candidatedetail": PageFactory.create({
        name: "candidatedetail",
        module: "复试管理",
        page: "考生详情",
        ifSchool: false,
        ifCollege: false
    }), 
    "majorlist": PageFactory.create({
        name: "majorList",
        module: "系统设置",
        page: "专业管理",
        ifSchool: true,
        ifCollege: true
    }), 
    "courselist": PageFactory.create({
        name: "courseList",
        module: "系统设置",
        page: "复试科目",
        ifSchool: true,
        ifCollege: true
    }), 
    "messagetemplatelist": PageFactory.create({
        name: "messageTemplateList",
        module: "系统设置",
        page: "消息模板",
        ifSchool: false,
        ifCollege: false
    }), 
    "messagerecordlist": PageFactory.create({
        name: "messagerecordlist",
        module: "系统设置",
        page: "消息列表",
        ifSchool: true,
        ifCollege: true
    }), 
    "applicationreview": PageFactory.create({
        name: "applicationReview",
        module: "复试管理",
        page: "材料审核",
        ifSchool: true,
        ifCollege: true
    }), 
    "examinationresult": PageFactory.create({
        name: "examinationResult",
        module: "复试管理",
        page: "复试结果",
        ifSchool: true,
        ifCollege: true
    }), 
    "bloglist": PageFactory.create({
        name: "blogList",
        module: "信息管理",
        page: "信息列表",
        ifSchool: true,
        ifCollege: true
    }), 
    "blogcatelist": PageFactory.create({
        name: "blogList",
        module: "信息管理",
        page: "信息分类",
    }), 
    "addblog": PageFactory.create({
        name: "addBlog",
        module: "信息管理",
        page: "添加信息",
        ifSchool: false,
        ifCollege: false
    }), 
    "examinationschedule": PageFactory.create({
        name: "examinationschedule",
        module: "复试管理",
        page: "复试安排",
        ifSchool: true,
        ifCollege: true
    }), 
    "addexaminationschedule": PageFactory.create({
        name: "addexaminationschedule",
        module: "复试管理",
        page: "添加复试安排",
        ifSchool: true,
        ifCollege: true
    }), 
    "loglist": PageFactory.create({
        name: "loglist",
        module: "权限管理",
        page: "系统日志",
        ifSchool: false,
        ifCollege: false
    }), 
};

exports.PageCollection = PageCollection;

