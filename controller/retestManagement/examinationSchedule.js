import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getCandidateScheduleList() {
    let api = ApiCollection['post/admin/Schedule/CandidateScheduleList'];
    return new DataSource(api, {
        // group: {
        //     field: "scheduleId",
        //     compare: function (a, b) {
        //         return b.items[0].startTime - a.items[0].startTime;
        //     }
        // },
        schema: {
            model: {
                id:"id",
                fields: {
                    isNotify: { type: 'boolean' },
                    isStart: { type: 'boolean' },
                    startTime: { type: 'date' },
                    endTime: { type: 'date' },
                }
            }
        }
    })
}
export function getScheduleList() {
    let api = ApiCollection['post/admin/Schedule/ScheduleList'];
    return new DataSource(api, {
        schema: {
            model: {
                id: "scheduleId",
                fields: {
                    isNotify: { type: 'boolean' },
                    isStart: { type: 'boolean' },
                    startTime: { type: 'date' },
                    endTime: { type: 'date' },
                }
            },

        }
    })
}
export function getNotStartScheduleList() {
    let api = ApiCollection['post/admin/Schedule/ScheduleList'];
    return new DataSource(api, {
        schema: {
            model: {
                id: "scheduleId",
                fields: {
                    isNotify: { type: 'boolean' },
                    isStart: { type: 'boolean' },
                    startTime: { type: 'date' },
                    endTime: { type: 'date' },
                }
            },
            data: function (res) {
                let data = res.filter((v) => {
                    return !v.isStart
                })
                return data
            }
        }
    })
}
export function addSchedule(data) {
    let api = ApiCollection['post/admin/Schedule/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}

export function editSchedule(data) {
    let api = ApiCollection['post/admin/Schedule/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function deleteSchedule(data) {
    let api = ApiCollection['post/admin/Schedule/Delete'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getScheduleById(data) {
    let api = ApiCollection['post/admin/Schedule/GetById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getApplicationCount(data) {
    let api = ApiCollection['post/admin/Schedule/ApplicationCount'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
//导出复试安排
export function exportSchedule(data) {
    let api = ApiCollection['post/admin/Schedule/Export'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getScheduleGetById(data) {
    let api = ApiCollection['post/admin/Schedule/GetById'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function getCandidateByScheduleId(data) {
    let api = ApiCollection['post/admin/Schedule/GetById'];
    return new DataSource(api, {
        schema: {
            model: {
                fields: {
                    isNotify: { type: 'boolean' }
                }
            },
            data: function (data) {
                let group = data.scheduleGroupDatas
                group.map((v) => {
                    v.scheduleId = data.id;

                    return v
                })
                function compare(key) {
                    return function (value1, value2) {
                        return value1[key] - value2[key];
                    }
                }
                group.sort(compare("order"))
                return group
            }
        }
    })
}
//移动分组
export function moveToOtherSchedule(data) {
    let api = ApiCollection['post/admin/Schedule/Move'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}