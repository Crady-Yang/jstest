import { BaseComponent } from './baseComponent';
import { LoadingContainer } from './loadingContainer';
import { Config } from '../common/config';
import { ErrorNotification } from '../component/notification'
console.log(memoryStore.get('config'))
//const coreService = memoryStore.get('config').coreService;
const api = memoryStore.get('api');
const defaultAvatarPath = Config.defaultAvatarPath;
const defaultPicturePath = Config.defaultPicturePath;

let token = Cookies.get('tk');
let app = memoryStore.get('authString');


let typeMap = {
	//公共图片，头像等
   portrait:{
    method: "post",
    url:"/File/FileSystem/GetFileIdInfo",
    //url:`${coreService}Rbac/User/ImageVerificationCode`,
    getData(path){
      return {
        data:{
          "id": path,
          "storeFileKind": 0  //默认本地
        }
      }
    },
	  headers: {
          'Authorization': 'Bearer ' + token,
		  'Auth-Appid':app
	  },
    defaultPath:defaultAvatarPath
    },
    public: {
        method: "post",
        url: "/File/FileSystem/GetFileIdInfo",
        //url:`${coreService}Rbac/User/ImageVerificationCode`,
        getData(path) {
            return {
                data: {
                    "id": path,
                    "storeFileKind": 0  //默认本地
                }
            }
        },
        headers: {
            'Authorization': 'Bearer ' + token,
            'Auth-Appid': app
        },
        defaultPath: defaultPicturePath
    },
};

/**
 * opt.type 请求不同的图片接口地址，返回的都是图片
 * el是wrapper dom
 * 图片加载组件
 */
export class ImageLoader extends BaseComponent{
  constructor(el,opt){
	  opt = opt || {};
    super(el,opt);
    if(opt.type && !ImageLoader.type.includes(opt.type)){
      throw new Error(`ImageLoader Error:${opt.type} is invalid`)
    }
    opt = opt || {};
    opt = Object.assign({
      ifResize:true,
	    ifCache:true
    },opt);
    let loadingOpt = opt.loadingOpt || { colorType:'deep' };
    this.type = opt.type || 'product';
    this.mode = opt.mode || 'contain';  // contain | cover
    this.width = opt.width || this.$el.width(); // 容器尺寸
    this.height = opt.height || this.$el.height();  // 容器尺寸
    this.loader = new LoadingContainer(el,loadingOpt);
    this.onLoadStart  = opt.onLoadStart || function () {};
    this.onLoadEnd = opt.onLoadEnd || function () {};
    this.onLoadSuccess = opt.onLoadSuccess || function () {};
    this.onLoadError = opt.onLoadError || function () {};
    this.img = document.createElement("img");
    this.imageWidth = 0;  // 图片实际尺寸
    this.imageHeight = 0;
    this.realImageWidth = 0;  // 图片在容器中的尺寸
    this.realImageHeight = 0;
    this.ifResize = opt.ifResize;
    this.ifCache = opt.ifCache; //是否缓存图片数据
    this.attr = opt.attr;
    this.path = null; //最近一次加载的图片路径
    this.$el.addClass('imageLoaderWrapper')
    this.headers = opt.headers;

  }

  calSize(type){
    if(this.ifResize){
      this.calImageSizeWithContainer();
      if(this.mode === 'contain'){
        if (this.imageWidth < this.imageHeight) {
          this.$el.find('img').css({ 'height': '100%', 'width': 'auto', 'margin': '0 auto' });
          // this.imageHeight = this.$el.find('img').height();
          // this.imageWidth = this.$el.find('img').width();
          this.$el.css({ 'background-color': '#f9f9f9', 'text-align': 'center', 'vertical-align': 'middle' });
        } else if(this.imageWidth > this.imageHeight){
          //计算margintop
          //console.log(marginTop);
          this.$el.find('img').css({ 'height': 'auto', 'width': '100%' });
          // this.imageHeight = this.$el.find('img').height();
          // this.imageWidth = this.$el.find('img').width();
          let paddingTop = (this.height - this.realImageHeight) / 2;
          this.$el.css({ 'background-color': '#f9f9f9', 'text-align': 'center', 'vertical-align': 'middle',"paddingTop":paddingTop + 'px' });
        }else {
          this.$el.find('img').css({ 'height': 'auto', 'width': '100%', 'margin': '0 auto' });
        }
      }
      if(this.mode === 'cover'){
        let containerPercent = this.width/this.height;
        let imagePercent = this.imageWidth/this.imageHeight;
        if(containerPercent > imagePercent){
          // 宽度填不满
          this.$el.find('img').css({ 'height': 'auto', 'width': '100%'});
          // this.imageHeight = this.$el.find('img').height();
          // this.imageWidth = this.$el.find('img').width();
          let marginTop = (this.height - this.realImageHeight) / 2;
          this.$el.find('img').css({ 'marginTop': marginTop + 'px'});
        }else if(containerPercent < imagePercent){
          this.$el.find('img').css({ 'height': '100%', 'width': 'auto'});
          // this.imageHeight = this.$el.find('img').height();
          // this.imageWidth = this.$el.find('img').width();
          let marginLeft = (this.width - this.realImageWidth) / 2;
          this.$el.find('img').css({ 'marginLeft': marginLeft + 'px'});
        }else {
          this.$el.find('img').css({ 'height': '100%', 'width': '100%'});
        }
      }
    }
  }

  // 根据图片的尺寸和container的尺寸，计算Image在这个container里面的实际尺寸
  calImageSizeWithContainer(){
    let containerPercent = this.width/this.height;
    let imagePercent = this.imageWidth/this.imageHeight;
    if(containerPercent > imagePercent){
      // 竖着的图
     this.realImageHeight = this.height;
     this.realImageWidth = this.imageWidth * (this.height/this.imageHeight);

    }else if(containerPercent < imagePercent){
      // 横着的图
      this.realImageWidth = this.width;
      this.realImageHeight = this.imageHeight * (this.width/this.imageWidth)

    }else {
      // 宽高一样
      this.realImageWidth = this.width;
      this.realImageHeight = this.height;
    }
  }


  load(path){
    this.$el.empty();
    let that = this;
    let cache = memoryStore.get('pictureCache') || {};
    if(path){
      this.path = path
    }
    let cacheData = cache[path];
    if(path && cacheData){
	    that.img = document.createElement("img");
	    that.img.src = cacheData.url;
	    that.$el.append(that.img);
	    that.imageWidth = cacheData.width;
	    that.imageHeight = cacheData.height;
      that.calSize('cache');
	    that.img.setAttribute('data-path',path);
	    that.onLoadSuccess(path,that);
	    that.onLoadEnd(path);
    }else if(!path && this.type !== 'code'){
      //加载默认图片
      let defaultPath = typeMap[that.type].defaultPath;
      this.img.className = 'defaultImage';
      this.img.src = defaultPath;
      this.$el.append(this.img);
    }else {
      //加载远程图片
      this.loader.start();
      this.onLoadStart(this.$el);
      //let token = Cookies.get('tk');
      let app = memoryStore.get('authString');
      let t = typeMap[this.type];
      let data = t.getData(path);
      let opt = Object.assign({},{
        method:'post'
      },t,data);
      let headers = opt.headers || {};
      let optHeaders = this.headers ? this.headers() : {};
      opt.headers = Object.assign({},headers,optHeaders);
      console.log(opt.headers);
      axios.request(opt)
          .then(function (response) {
          // 获取图片失败
          if(!response.data){
            let message = response.message || `${path} load error`;
            that.$el.empty().append(`<p>${message}</p>`);
            return
          }
          // 获取到图片流数据
            let url = response.data.data;
              that.img.src = `/${url[0]}`;
              that.img.setAttribute('data-id', path);
              that.$el.empty().append(that.img);
              that.calSize();
        })
        .catch(function (error) {
          console.log('--------- image load error -------');
          console.log(error);
          console.log(error.message);
	        let errorText = '';
          if(typeof error === 'string'){
            errorText = error
          }else if(typeof error.message === 'string'){
	          errorText = error.message
          }else {
            errorText = 'load image error'
          }
          that.$el.empty().append(`<span>${ errorText }</span>`);
          that.onLoadError(error);
          that.onLoadEnd(path);
        })
    }
  }



}

ImageLoader.type = ['portrait','product','public'];
