import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getCourseList(data) {
    let api = ApiCollection['post/admin/Course/CourseList'];
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
export function getCourseSelectList(data) {
    let api = ApiCollection['post/admin/Course/CourseList'];
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
export function addCourse(data) {
    let api = ApiCollection['post/admin/Course/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editCourse(data) {
    let api = ApiCollection['post/admin/Course/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function deleteCourse(data) {
    let api = ApiCollection['post/admin/Course/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getCourseInfoById(data) {
    let api = ApiCollection['post/admin/Course/GetById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
