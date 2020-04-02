import { HttpService } from '../../common/httpService';
import { ApiCollection } from '../../common/apiCollection';
import { DataSource, HierarchicalDataSource } from "../../kendoDataSource";

export function addCollege(data) {
    let api = ApiCollection['post/admin/College/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}


export function editCollege(data) {
    let api = ApiCollection['post/admin/College/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function deleteCollege(data) {
    let api = ApiCollection['post/admin/College/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getCollegeDetail(data) {
    let api = ApiCollection['post/admin/College/GetById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getCollegeSelectList(data) {
    let api = ApiCollection['post/admin/College/CollegeSelectList'];
    return new DataSource(api)
}
