import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getBlogList(data) {
    let api = ApiCollection['post/admin/Blog/ListBlogsInfo'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    isDisplay: { type: 'boolean' },
                    enabled: { type: 'boolean' },
                    isShowHome: { type: 'boolean' },
                    isTop: { type: 'boolean' },
                    isPublish: { type: 'boolean' },
                    creationTime : { type: 'date' },
                }
            }
        }
    })
}

export function addBlog(data) {
    let api = ApiCollection['post/admin/Blog/AddBlog'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editBlog(data) {
    let api = ApiCollection['post/admin/Blog/ModifyBlog'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function deleteBlog(data) {
    let api = ApiCollection['post/admin/Blog/DeleteBlog'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function getBlogInfoById(data) {
    let api = ApiCollection['post/admin/Blog/BlogInfo'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}