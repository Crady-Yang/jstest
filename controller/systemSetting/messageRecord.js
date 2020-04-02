import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getMessageRecordList(data) {
    let api = ApiCollection['post/admin/Message/MessageRecordList'];
    return new DataSource(api,{
        schema: {
            model: {
                fields: {
                    creationTime: { type: 'date' }
                }
            }
        }
    })
    //let http = new HttpService(api);
    //return http.request(data).then((data) => {
    //    return data
    //})
}
export function getMessageCount(data) {
    let api = ApiCollection['post/admin/Message/MessageCount'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

