import { HttpService } from '../common/httpService';
import { formatTreeData } from '../common/utils';
import { DataSource } from '../kendoDataSource'
import { GlobalStoreKey } from '../common/globalStoreKey'
import { ApiCollection } from '../common/apiCollection'

export function getAdminList(data) {
    let api = ApiCollection['post/admin/User/AdminList'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    enabled: { type: 'boolean' },
                    creationTime: { type: 'date' },
                }
            }
        }
    })
}
export function getCurrentUserInfo(data) {
    let api = ApiCollection['post/admin/User/GetCurrentUser'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function addUser(data) {
    let api = ApiCollection['post/admin/User/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editUser(data) {
    let api = ApiCollection['post/admin/User/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function enableUser(data) {
    let api = ApiCollection['post/admin/User/Enable'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function deleteUser(data) {
    let api = ApiCollection['post/admin/User/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getCandidateList(data) {
    let api = ApiCollection['post/admin/User/CandidateList'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    gender: { type: 'boolean' },
                    isFreshGraduate: { type: 'boolean' },
                    isArrangeInterview: { type: 'boolean' },
                    isArrangeWrittenExamination: { type: 'boolean' },
                    examinationScore: { type: 'number' },
                    totalScore: { type: 'number' },
                    preScore:{ type: 'number'}
                }
            }
        }
    })
}
export function login(data) {
    let api = ApiCollection['post/admin/User/Login'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function imageVerificationCode(data) {
    let api = ApiCollection['get/admin/User/ImageVerificationCode'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
//给用户授权角色
export function authRole2User(data) {
    let api = ApiCollection['post/admin/User/BindingRoles'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
//给用户或者角色授权资源+移除授权+编辑授权
export function authPermission2User(data) {
    let api = ApiCollection['post/admin/User/SettingPermissions'];
	let http = new HttpService(api);
	return http.request(data)
}

//获取用户或者角色的Permission
export function getTargetPermission(data) {
    let api = ApiCollection['post/admin/User/GetPermissionsByUser'];
    return new DataSource(api)
}

export async function getUserById(data) {
    let api = ApiCollection['post/admin/User/GetById']; 
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export async function getCandidateById(data) {
    let api = ApiCollection['post/admin/User/GetCandidateById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export async function getRecordsById(data) {
    let api = ApiCollection['post/admin/User/GetRecordsById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export async function getUserAllInfoById(data) {
    let userDataApi = ApiCollection['post/admin/User/GetById'];
    let candidateDataApi = ApiCollection['post/admin/User/GetCandidateById'];
    let eaxminationDataApi = ApiCollection['post/admin/User/GetRecordsById'];
    let userDataHttp = new HttpService(userDataApi);
    let candidateDataHttp = new HttpService(candidateDataApi);
    let eaxminationDataHttp = new HttpService(eaxminationDataApi);
    let userData = await userDataHttp.request(data).then((data) => {
        return data
    })
    let candidateData = await candidateDataHttp.request(data).then((data) => {
        return data
    })
    let eaxminationData = await eaxminationDataHttp.request(data).then((data) => {
        return data
    })
    let finalData = Object.assign({}, userData, candidateData, eaxminationData)
    return finalData
}
export function adminResetPassword(data) {
    let api = ApiCollection['post/admin/User/ResetPassword'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function SimulatedSchoolManagement(data) {
    let api = ApiCollection['post/admin/User/SimulatedSchoolManagement'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function adminEditPassword(data) {
    let api = ApiCollection['post/admin/User/EditPassword'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function forgetPassword(data) {
    let api = ApiCollection['post/admin/User/ForgetPassword'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function newPassword(data) {
    let api = ApiCollection['post/admin/User/NewPassword'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}


