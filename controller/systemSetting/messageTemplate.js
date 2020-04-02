import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getMessageTemplateList(data) {
    let api = ApiCollection['post/admin/Message/MessageTemplateList'];
    return new DataSource(api, {
        type:"data",
        schema: {
            data: function (res) {
                console.log(res)
                return res.list
            }
        }

    })
    //let http = new HttpService(api);
    //return http.request(data).then((data) => {
    //    return data
    //})
}
export function getMessageTemplateSelectList(data) {
    let api = ApiCollection['post/admin/Message/MessageTemplateSelectList'];
    return new DataSource(api, {
        type:"data",

    })
}

export function addMessageTemplate(data) {
    let api = ApiCollection['post/admin/Message/CreateTemplate'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function deleteMessageTemplate(data) {
    let api = ApiCollection['post/admin/Message/DeleteTemplate'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function enableTemplate(data) {
    let api = ApiCollection['post/admin/Message/EnableTemplate'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editMessageTemplate(data) {
    let api = ApiCollection['post/admin/Message/EditTemplate'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function wxGetTemplateList(data) {
    let api = ApiCollection['post/admin/Message/WxGetTemplateList'];
    return new DataSource(api)
}
export function WxAddTemplates(data) {
    let api = ApiCollection['post/admin/Message/WxAddTemplates'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function WxModifyTemplates(data) {
    let api = ApiCollection['post/admin/Message/WxModifyTemplates'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function SendTemplateMessage(data) {
    let api = ApiCollection['post/admin/Message/SendTemplateMessage'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function SendMessage(data) {
    let api = ApiCollection['post/admin/Message/SendMessage'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
