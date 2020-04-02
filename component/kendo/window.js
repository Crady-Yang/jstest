import { BaseComponent } from '../baseComponent'
import { isJson } from '../../common/utils'

let defaultOption = {
	minWidth:'30%',
	minHeight:'100px',
	maxWidth:'80%',
	title:'unKnow title',
    resizable: false
};

export class KendoWindow extends BaseComponent{
	constructor(el,opt){
		opt = opt || {};
		super(el,opt);
		// console.log('----- KendoWindow -------');
		// console.log(el);
		// console.log(opt);
		this.$el.hide();
		this.size = opt.size || 'medium';
		let width = this.getWidth(opt);
		this.option = Object.assign(defaultOption,{
			width:width
        }, opt);
		this.instance = this.$el.kendoWindow(this.option).data("kendoWindow");
		let titleId = this.$el.attr('aria-labelledby');
		this.$title = $(`#${titleId}`);
	}

	updateTitle(title){
		this.$title.empty().html(title);
	}

	getWidth(opt){
		let windowWidth = window.innerWidth;
		if(opt.width){
			this.width = opt.width;
			return opt.width
		}
		if(this.size === 'small'){
			this.width = windowWidth*0.4;
			return '40%'
		}else if(this.size === 'medium'){
			this.width = windowWidth*0.5;
			return '50%'
		}else if(this.size === 'large'){
			this.width = windowWidth*0.7;
			return '70%'
		}else {
			return 'auto'
		}
	}

    open(data) {
		// if(opt){
		// 	this.opt = opt;
		// 	this.getOption();
		// 	this.instance.setOptions(this.option);
        // }
		this.data = data;
		let width = this.width;
		let windowWidth = window.innerWidth;
		let left = (windowWidth- width)/2;
		let w = this.$el.data("kendoWindow");
		if(this.width){
			w.setOptions({
				position:{
					top:'10rem',
					left:left
                },
                modal:true
			});
			w.open();
		}else {
			w.center().open();
		}

		//this.$el.data("kendoWindow").center().open();
	}



	close(){
		this.instance.close();
	}
}
