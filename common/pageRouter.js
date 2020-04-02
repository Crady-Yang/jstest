let collection = memoryStore.get('page');
import { trimChar } from './utils'

export class PageRouter {

	static goto(path){
		//判断是name还是路径
		if(path.indexOf('/') < 0){
			let t = collection[path];
			if(!t){
				throw new Error(`${path} is invalid`)
			}
			path = t.url;
		}

		window.location.href = path;
	}

	// 根据名字获取地址
	static getUrl(name,params){
		let t = collection[name];
		if(!t){
			throw new Error(`${path} is invalid`)
		}
		let paramsList = [];
		let paramsString = '';
		if(params){
			for (let k in params){
				paramsList.push(`${k}=${params[k]}`)
			}
			paramsString = '?' + paramsList.join('&');
		}

		return t.url + paramsString;
	}

	static getCurrent(){
		let c = window.location.pathname.toLowerCase();
		for(let k in collection){
			// console.log('------ getCurrent --------');
			// console.log(c);
			// console.log(collection[k]);
			let cPath = collection[k].url ? collection[k].url.toLowerCase() : '';
			//除去首尾'/'
			// console.log(cPath);
			cPath = trimChar(cPath,'/');
			c = trimChar(c,'/');
			// console.log(cPath);
			if( cPath === c){
				return collection[k]
			}
		}
		return {}
	}

	/**
	 * 根据Node后台配置的PageCollection生成当前页面路径数据
	 * @returns {*}
	 */
	static getPath(){
		let p = Object.assign({},PageRouter.getCurrent());
		let current = Object.assign({},PageRouter.getCurrent());
		if(p.parent){
			//存在parent的时候，依次生成数组
			let parentList = p.parent.split('/').map((v)=>{
				let t = collection[v];
				if(t){
					return t
				}else {
					return {
						title:v,
						url:null
					}
				}
			});
			//当前路径上不需要有跳转
			parentList.push(Object.assign(current,{
				url:null
			}));
			return parentList
		}else {
			return [{
				title:p.title,
				url:null
			}]
		}
	}
}
