import { BaseComponent } from '../baseComponent';
import { Notification,ErrorNotification } from '../notification';
import {timeTFormatter} from '../../common/utils'

let apiCollection = memoryStore.get('api');
let config = memoryStore.get('config');
//let coreService = config.coreService;

//let publicPictureUrl = parseUrl(apiCollection.uploadPortrait.remote_url);

function parseUrl(url){
	if(url.indexOf('/') === 0){
		url = url.replace('/','')
	}
	return url
}

let typeMap = {
	//上传产品库图片
	publicPicture:{
		//apiTitle:publicPictureUrl,
		validation:{
            allowedExtensions: ["jpg", "png", "jpeg"],
			maxFileSize: 900000,
			minFileSize: 100
		},
		multiple: false,
		async:{
			autoUpload:true,
            saveUrl:`/File/FileSystem/Upload`
		},
	},
    uploadResult: {
        validation: {
            allowedExtensions: ['.xlsx', '.xls'],
            maxFileSize: 9194304,
            minFileSize: 100
        },
        multiple: false,
        async: {
            autoUpload: true,
            saveUrl: `/admin/Result/Import`
        }
    }
};

/**
 * 文件/图片上传
 * opt.type 对应不同的后台接口
 * opt.select 对应localization.select
 */
export class KendoUploader extends BaseComponent{
	constructor(el,opt){
		super(el,opt);
		opt = opt || {};
        let type = opt.type || 'publicPicture';
        let selectText = opt.selectText || 'select';
		let defaultOption = typeMap[type];
		let that = this;
		let option = Object.assign(defaultOption,opt);
		option.localization = {
			select:selectText
		};
		option.success = that.success;
		option.error = that.error;
		option.upload = that.upload;
		this.option = option;
		this.instance = this.$el.kendoUpload(option).data('kendoUpload');
		this.instance.opt = opt;  //原方法加在实例上
		this.instance.apiTitle = defaultOption.apiTitle;
	}

	success(e) {
		console.log('--------- success ---------')
		console.log(e.files)
		console.log(e.response)
		// this 指向 kendoUpload实例
		let responseError = e.response.error;
		let message = e.response.message || e.response.Message||"上传成功！";
		console.log(message);
		if(responseError === false){
            if (this.opt.success) {
				this.opt.success(e)
			}
			Notification.show(message,'success');
		}else {
			let that = this;
			if(this.opt.error){
				this.opt.error(e,that)
			}else {
				e.preventDefault();
				let title = this.apiTitle;
				ErrorNotification.error({
					title,
					message
				},'error');
			}

		}
	}

	upload(e) {
		console.log('--------- on upload add auth header ---------')
		console.log(this.opt);
		console.log(this);
		let xhr = e.XMLHttpRequest;
		xhr.addEventListener("readystatechange", function(e) {
			if (xhr.readyState == 1 /* OPENED */) {
				let token = Cookies.get('tk');
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
			}
		});
		if(this.opt.upload){
			this.opt.upload(e);
			console.log('---- upload data -----')
			console.log(e.data)
			// 转换时间
			for(let k in e.data){
				if(_.isDate(e.data[k])){
					e.data[k] = timeTFormatter(e.data[k])
				}
			}
			console.log(e.data)
		}
	}

	error(e) {
		console.log('--------- error ---------');
		console.log(e);
		let errorMessage='';
		if(e.XMLHttpRequest.responseText){
			errorMessage=JSON.parse(e.XMLHttpRequest.responseText).Message
		}
		if(this.opt.error){
			this.opt.error(e);
		}
		let title = this.apiTitle;
		ErrorNotification.error({
			title,
			message:errorMessage||'Upload Error'
		},'error');
		e.preventDefault();
	}

}
