import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'



export function getResourceGridDataSource(data) {
    let api = ApiCollection['post/admin/Resource/ResourceList'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    enabled: { type: 'boolean' }
                }
            }
        }
    })
}
export function getResourceSelectDataSource(data) {
    let api = ApiCollection['post/admin/Resource/ResourceList'];
    return new DataSource(api, {
        type:"data",
        schema: {
            model: {
                fields: {
                    enabled: { type: 'boolean' }
                }
            },
            data: function (res) {
                return res.list
            }
        }
    })
}
export function addResource(data) {
    let api = ApiCollection['post/admin/Resource/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editResource(data) {
    let api = ApiCollection['post/admin/Resource/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function enableResource(data) {
    let api = ApiCollection['post/admin/Resource/Enable'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function deleteResource(data) {
    let api = ApiCollection['post/admin/Resource/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}


