import { HttpService } from '../../common/httpService';
import { DataSource } from '../../kendoDataSource';
let apiCollection = memoryStore.get('api');

export function getApplicationDataSource() {
  let api = apiCollection.getApplicationList;
  return new DataSource(api,{ type:'data' })
}

export function addApplication(data) {
  let api = apiCollection.addApplication;
	let http = new HttpService(api);
  return http.request(data);
}

export function editApplication(data) {
  let api = apiCollection.editApplication;
	let http = new HttpService(api);
  return http.request(data);
}

export function deleteApplication(data) {
  let api = apiCollection.delApplication;
	let http = new HttpService(api);
  return http.request(data);
}

export function enableApplication(data) {
  let api = apiCollection.enableApplication;
	let http = new HttpService(api);
  return http.request(data);
}

export function resetApplicationSecret(data) {
  let api = apiCollection.resetSecret;
	let http = new HttpService(api);
  return http.request(data);
}
