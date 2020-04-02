import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'



export function addWxToken(data) {
    let api = { "url": "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxadfb85f876f94715&secret=130a462701f3caee7dd1beab1a5e405b", "method": "get", "reqDto": null };
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

export function editMessageTemplate(data) {
    let api = ApiCollection['post/admin/Message/EditTemplate'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
