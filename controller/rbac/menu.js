import { HttpService } from '../../common/httpService';
import { DataSource,TreeListDataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getMenuListDataSource() {
    let api = ApiCollection['post/admin/Menu/MenuList'];
	return new TreeListDataSource(api,{
		sort: { field: "sort", dir: "asc" },
        type: 'data',
        schema: {
            model: {
                fields: {
                    enabled: { type: 'boolean' },
                }
            }
        }
	})
}

export function getMenuList(data) {
    let api = ApiCollection['post/admin/Menu/MenuList'];
	let http = new HttpService(api);
	return http.request(data)
}
export function getLeftMenuList(data) {
    let api = ApiCollection['post/admin/Menu/PersonalMenu'];
    let http = new HttpService(api);
    return http.request(data)
}

//TODO creationTime 后台存的不是UTC时间
export function addMenu(data) {
	if(data.sort === ''){
		data.sort = '0'
	}
	data = Object.assign({
		enabled:true,
		parentId:'00000000-0000-0000-0000-000000000000',
		sort:'0'
	},data);
    let api = ApiCollection['post/admin/Menu/Create'];
	let http = new HttpService(api);
	return http.request(data)
}

export function editMenu(data) {
    let api = ApiCollection['post/admin/Menu/Edit'];
    let http = new HttpService(api);
	return http.request(data)
}

export function deleteMenu(data) {
    let api = ApiCollection['post/admin/Menu/Delete'];
    let http = new HttpService(api);
	return http.request(data)
}

export function enableMenu(data) {
    let api = ApiCollection['post/admin/Menu/Enable'];
    let http = new HttpService(api);
	return http.request(data)
}

