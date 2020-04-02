import { HttpService } from '../../common/httpService';
import { DataSource, HierarchicalDataSource} from "../../kendoDataSource";
import { ApiCollection } from '../../common/apiCollection'

export async function getSchoolTreeList() {
    let api = ApiCollection['post/admin/School/TreeList'];
    let getTreeData = new HttpService(api);
    let schoolData = await getTreeData.request({}).then((data) => {
        let t = data.map((v) => {
            for (let i = 0; i < v.colleges.length; i++) {
                v.colleges[i]["schoolId"] = v.id
            }
            return v
        })
        return t
    });
    console.log(schoolData)
    let dataSource = new kendo.data.HierarchicalDataSource({
        data: schoolData,
        schema: {
            model: {
                id: "id",
                children: "colleges"
            }
        }
    });
    console.log(schoolData,dataSource)
    return {
        schoolData,
        dataSource
    }
}
export function getSchoolSelectList(data) {
    let api = ApiCollection['post/admin/School/SchoolSelectList'];
    return new DataSource(api)
}
export function addSchool(data) {
    let api = ApiCollection['post/admin/School/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editSchool(data) {
    let api = ApiCollection['post/admin/School/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function getSchoolDetail(data) {
    let api = ApiCollection['post/admin/School/GetById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function deleteSchool(data) {
    let api = ApiCollection['post/admin/School/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}



