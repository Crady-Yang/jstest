import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getListBlogCategoryInfo(data) {
    let api = ApiCollection['post/admin/BlogCategory/GetBlogCategoryInfo'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    enabled: { type: 'boolean' },
                    isDisplay: { type: 'boolean' },
                    creationTime: { type: 'date'}
                }
            }
        }
    })
}
export function getBlogSelectList(data) {
    let api = ApiCollection['post/admin/BlogCategory/ListBlogCategoryInfo'];
    return new DataSource(api, { type: 'data' })
}
export function addBlogCategory(data) {
    let api = ApiCollection['post/admin/BlogCategory/AddBlogCategory'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editBlogCategory(data) {
    let api = ApiCollection['post/admin/BlogCategory/ModifyBlogCategory'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function deleteBlogCategory(data) {
    let api = ApiCollection['post/admin/BlogCategory/DeleteBlogCategory'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}