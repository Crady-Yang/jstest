import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getMajorList(data) {
    let api = ApiCollection['post/admin/Major/MajorList'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    ifShowScore: { type: 'boolean' },
                    ifAcceptDispensing:{type: 'boolean' },
                    enabled: { type: 'boolean' }
                }
            }
        }
    })
}
export function getMajorDropdownList(data) {
    let api = ApiCollection['post/admin/Major/MajorSelectList'];
    return new DataSource(api)
}

export function addMajor(data) {
    let api = ApiCollection['post/admin/Major/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editMajor(data) {
    let api = ApiCollection['post/admin/Major/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function enableMajor(data) {
    let api = ApiCollection['post/admin/Major/Enable'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function deleteMajor(data) {
    let api = ApiCollection['post/admin/Major/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function getExaminationCoursesByMajor() {
    let api = ApiCollection['post/admin/Major/GetExaminationCoursesByMajor'];
    return new DataSource(api, {
        schema: {
            data: function (res) {
                let data=res.filter((v) => {
                    return v.isSelect
                })
                return data
            }
        }
    })
}
export function getExaminationCoursesSelect(data) {
    let api = ApiCollection['post/admin/Major/GetExaminationCoursesByMajor'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function bindingExaminationCourses(data) {
    let api = ApiCollection['post/admin/Major/BindingExaminationCourses'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}