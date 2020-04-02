import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'



export function getPictureList(data) {
    let api = ApiCollection['post/File/FileSystem/GetFileInfo'];
    return new DataSource(api);
}
export function uploadPicture(data) {
    let api = ApiCollection['post/File/FileSystem/Upload'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getPicturePathById(data) {
    let api = ApiCollection['post/File/FileSystem/GetFileIdInfo'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}



