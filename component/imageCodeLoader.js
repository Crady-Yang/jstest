import { ImageLoader } from './imageLoader'
import { createGuid } from '../common/utils'
import { Notification } from './notification'

// 全局的验证码访问频率不能超过4秒，1秒为返回途中损耗
let lastGetTime = 0;
let lastPointTime = 0;
let ifAlert = true;

export class ImageCodeLoader extends ImageLoader {
 constructor(el,opt){
   opt = opt || {};
   opt = Object.assign({
     type:'code',
     loadingOpt:{
       color:'var(--main-h)'
     },
     headers(){
       let verificationtoken = this.verificationtoken || '';
       return {
         verificationtoken
       }
     },
     onLoadSuccess(response){
       let imageCodeToken = (response && response.headers) ? response.headers.verificationtoken : null;
       this.verificationtoken = imageCodeToken;
       if(imageCodeToken){
         let uuid = this.uuid;
         memoryStore.set(`verificationToken_${uuid}`,imageCodeToken);
         // 请求完了记录当前时间
         lastGetTime = Date.now();
       }else {
         throw new Error('imageCodeToken error')
       }
     }
   },opt);
   super(el,opt);
   let that = this;
   this.uuid = createGuid();
   this.verificationtoken = '';
   this.$el.off('click').on('click',function () {
     if((Date.now() - lastPointTime) < 4000){
       if(ifAlert){
         Notification.show('Refresh Verification Code frequently','warning');
         ifAlert = false
       }
     }else {
       that.load();
       ifAlert = true
     }
     if(ifAlert){
       lastPointTime = Date.now();
     }

   });
 }

 getVerificationToken(){
   let uuid = this.uuid;
   return memoryStore.get(`verificationToken_${uuid}`);
 }
}
