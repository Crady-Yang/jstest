import { BaseComponent } from './baseComponent';
import { KendoWindow } from './kendo/window';
import { LoadingContainer } from './loadingContainer';



export class ConfirmWindow extends BaseComponent{
	constructor(el,opt){
        super(el, opt);
		let that = this;
		opt = opt || {};
        opt = this.getDefaultOption(opt);
		this.type = opt.type; //delete enable disable，决定title和content的内容
		this.onSubmit = opt.onSubmit;  //type:function return promise 点击提交的回调
		this.nameField = opt.nameField;
        this.idField = opt.idField;
        this.title = opt.title;
        this.data = null; //show 的时候加载
        this.window = new KendoWindow(el, { size: 'small', open: function () { }});
		let titleId = this.window.$el.attr('aria-labelledby');
		this.$title = $(`#${titleId}`);
		this.titleTemplate = opt.titleTemplate;
		this.paramsMap = opt.paramsMap; //接收data数据，加工传回去的参数
		this.onSuccess = opt.onSuccess; //function  onSubmit请求成功的回调
		this.onError = opt.onError; //function  onSubmit请求失败的回调
		this.contentTemplate = function (data) {
			let t = opt.contentTemplate(data);
			return `
				<div class="confirm-window-content-wrapper" style="padding:10px 0px">
					${t}
				</div>
				<div class="clearfix">
					<button data-id="${data[that.idField]}" class="k-button k-primary pull-right">submit</button>
				</div>
			`
        }; //function
	}

    open(data) {
        let that = this;
        this.data = data;
        let title = this.titleTemplate(data);
		let content = this.contentTemplate(data);
		this.$el.empty().append(content);
		this.$title.empty().append(title);
		let id = data[this.idField];
		let $button = this.$el.find(`button[data-id=${id}]`);
		let loading = new LoadingContainer($button);
		$button.on('click',function () {
			loading.start();

			let params = that.paramsMap ? that.paramsMap(data):data;
			that.onSubmit(params).then((data)=>{
				//成功 关闭window
				loading.stop();
				that.window.close();
				that.onSuccess(data);
			}).catch((error)=>{
				loading.stop();
				that.onError(error);
			})
		});
		console.log(data);
        console.log(this.window);
		this.window.open();
	}

	getDefaultOption(opt){
		let type = opt.type || 'delete';
		let typeMap = {
			'enable':{
				paramsMap:function(data){
					let enabled = true;
					if(_.isArray(data)){
						let ids = data.map((v)=>{
							return v[opt.idField]
						}).join(',');
						return { ids,enabled }
					}else {
						let id = data[opt.idField];
						return { id,enabled }
					}
				},
				title:function (data) {
					let etc = '';
					if(_.isArray(data)){
						data = data[0];
						etc = 'etc.'
					}
					return `Enable ${data[opt.nameField]} ${etc}`
				},
				content:function (data) {
					let etc = '';
					if(_.isArray(data)){
						data = data[0];
						etc = 'etc.'
					}
					return `确认启用 ${data[opt.nameField]} ${etc}吗？`
				}
			},
			'disable':{
				paramsMap:function(data){
					let enabled = false;
					if(_.isArray(data)){
						let ids = data.map((v)=>{
							return v[opt.idField]
						}).join(',');
						return { ids,enabled }
					}else {
						let id = data[opt.idField];
						return { id,enabled }
					}
				},
				title:function (data) {
					let etc = '';
					if(_.isArray(data)){
						data = data[0];
						etc = 'etc.'
					}
					return `Disable ${data[opt.nameField]} ${etc}`
				},
				content:function (data) {
					let etc = '';
					if(_.isArray(data)){
						data = data[0];
						etc = 'etc.'
					}
					return `确认禁用 ${data[opt.nameField]} ${etc}吗？`
				}
			},
			'delete':{
				paramsMap:function(data){
					if(_.isArray(data)){
						let ids = data.map((v)=>{
							return v[opt.idField]
						}).join(',');
						return { ids }
					}else {
						let id = data[opt.idField];
						return { id }
					}
				},
				title:function (data) {
					let etc = '';
					if(_.isArray(data)){
						data = data[0];
						etc = 'etc.'
					}
					return `Delete ${data[opt.nameField]} ${etc}`
				},
				content:function (data) {
					let etc = '';
					if(_.isArray(data)){
						data = data[0];
						etc = 'etc.'
					}
					return `确认删除 ${data[opt.nameField]} ${etc}吗？`
				}
            },
            'other': {
                paramsMap: function (data) {
                    if (_.isArray(data)) {
                        return { ids:data }
                    } else {
                        let id = data[opt.idField];
                        return { id }
                    }
                },
                title: function () {
                    return opt.title;
                },
                content: function (data) {
                    return opt.content
                }
            },
		};
		opt = Object.assign({},{
			nameField:'name',
			idField:'id',
			titleTemplate: typeMap[type].title,
			contentTemplate:typeMap[type].content,
			paramsMap:typeMap[type].paramsMap,
			onSuccess:function () {},
			onError:function () {}
		},opt);
		return opt;
	}
}
