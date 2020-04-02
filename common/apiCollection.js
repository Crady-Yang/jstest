import { SwaggerApi } from '../generated/api'
import { ApiDefinition } from './apiDefinition'
import { Api } from './apiService'
import { deepMerge } from './deepMerge'

let collection = deepMerge(SwaggerApi, ApiDefinition);

let final = {};

for(let k in collection){
    final[k] = new Api(k,collection[k])
}
export const ApiCollection = final;



