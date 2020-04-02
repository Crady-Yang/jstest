import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource'
import { ApiCollection } from '../../common/apiCollection'

export function getResultList(data) {
    let api = ApiCollection['post/admin/Result/ResultList'];
    return new DataSource(api,{
        schema: {
            model: {
                fields: {
                    isFreshGraduate: { type: 'boolean' },
                    isNotify: { type: 'boolean' },
                    ifReceive: { type: 'boolean' },
                    writtenScore: { type: 'number' },
                    interviewScore: { type: 'number' },
                    examinationScore: { type: 'number' },
                    preScore: { type: 'number' },
                    totalScore: { type: 'number' },
                }
            }
        }
    })
}


export function addResult(data) {
    let api = ApiCollection['post/admin/Result/Create'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
export function editResult(data) {
    let api = ApiCollection['post/admin/Result/Edit'];
    let http = new HttpService(api);
    return http.request(data).then((data) => {
        return data
    })
}
