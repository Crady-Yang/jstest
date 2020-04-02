export const ApiDefinition = {
    'post/admin/Message/WxAddTemplates': {
        reqDto: {
            "remark": { "type": "string", "required": true }
        }
    },
    'post/admin/School/Create':{
        reqDto: {
            "code": { "type": "string", "required": true }
        }
    },
    'post/admin/Blog/ModifyBlog':{
        reqDto: {
            "collegeId": { "type": "string", "required": false }
        }
    },
    'post/admin/Blog/AddBlog':{
        reqDto: {
            "collegeId": { "type": "string", "required": false },
            "metaKeywords": { "type": "string", "required": false },
            "metaDescription": { "type": "string", "required": false },
            "metaTitle": { "type": "string", "required": false },
        }
    }
};