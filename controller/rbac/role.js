import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getRoleDropDownList(fn) {
	let api = apiCollection.getRoleList;
	return new DataSource(api,{
		schema:{
			data:function (data) {
				return data.data
			}
		},
		type:'data' }).mergeQuery(fn);
}

export function getRoleList(data) {
    let api = ApiCollection['post/admin/User/GetRolesByUser'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}


export function getRoleGridDataSource(data) {
    let api = ApiCollection['post/admin/Role/RoleList'];
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

export function addRole(data) {
    let api = ApiCollection['post/admin/Role/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editRole(data) {
    let api = ApiCollection['post/admin/Role/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}


export function deleteRole(data) {
    let api = ApiCollection['post/admin/Role/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
//给用户或者角色授权资源+移除授权+编辑授权
export function authPermission2Role(data) {
    let api = ApiCollection['post/admin/Role/SettingPermissions'];
    let http = new HttpService(api);
    return http.request(data)
}

//获取用户或者角色的Permission
export function getRolePermission(data) {
    let api = ApiCollection['post/admin/Role/GetPermissionsByRole'];
    return new DataSource(api)
}



