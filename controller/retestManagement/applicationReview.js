import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getApplicationList(data) {
    let api = ApiCollection['post/admin/Application/ApplicationList'];
    return new DataSource(api,{
        schema: {
            model: {
                fields: {
                    ifRequest: { type: 'boolean' },
                    ifReceive: { type: 'boolean' },
                    approveTime: { type: 'date' },
                    creationTime: { type: 'date' }
                }
            }
        }
    })
}
export function getBeforeScheduleList(data) {
    let api = ApiCollection['post/admin/Application/BeforeScheduleList'];
    return new DataSource(api)
}
export function auditApplication(data) {
    let api = ApiCollection['post/admin/Application/Audit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function resetApplication(data) {
    let api = ApiCollection['post/admin/Application/Reset'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
