import { BaseComponent } from './baseComponent';
import {ErrorNotification} from "./notification";

let apiCollection = memoryStore.get('api');

export class fileDownLoader extends BaseComponent {
    constructor(el, opt) {
        super(el, opt);
        opt = opt || {};
        let that = this;
        // option.success = that.success;
    }

    init(){
        let that=this;
        this.$el.off('click').on('click',function () {
            let method=that.opt.method;
            that.download();
        })
    }
    download(param){
        let that=this;
        let xhr = new XMLHttpRequest();
        let url=param?`${this.opt['url']}?${param}`:this.opt['url'];
        xhr.open(that.opt['method'],url, true);
        xhr.responseType = "blob";
        xhr.setRequestHeader("Authorization", 'Bearer '+Cookies.get('tk'));
        xhr.setRequestHeader('auth-appid',memoryStore.get('authString'));
        xhr.onload = function() {
            if (this.status === 200) {
                if(that.opt.success){
                    that.opt.success();
                }
                let blob = new Blob([this.response]); // 转成文本存储
                let fileName = xhr.getResponseHeader('content-disposition');
                if(fileName){
                    let json = window.decodeURI(fileName.split('=')[1]);
                    fileName=json.split(';')[0]
                }
                let a = document.createElement('a'); // 转换完成，创建一个a标签用于下载
                a.download =fileName;
                console.log(fileName);
                a.href = window.URL.createObjectURL(blob); // 转成本地连接到blob文本
                a.click();
            }else{
                if(that.opt.error){
                    that.opt.error();
                }
                let title = that.opt.url;
                ErrorNotification.show({
                    title,
                    message:'download Error'
                },'error');
            }
        };
        if(that.opt.method==='post'){
            xhr.setRequestHeader('Content-Type', 'application/json');
            let data = JSON.stringify(that.opt.data);
            xhr.send(data)
        }else{
            xhr.send();
        }

    };

}