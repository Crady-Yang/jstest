import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getLogList(data) {
    let api = ApiCollection['post/admin/User/LogList'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    logged: { type: 'date' }
                }
            }
        }
    })
}
