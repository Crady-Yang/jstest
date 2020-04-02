import { BaseComponent } from './baseComponent'

export class DropDownMenu extends BaseComponent{

	constructor(el,opt){
		super(el,opt);
		this.data = opt.data;
		this.$button = opt.$button;
		this.$ul = null;
		this.idField = opt.idField || 'id';
		this.textField = opt.textField || 'text';
	}

	init(){
		if(this.$ul){
			this.$ul.remove();
		}
		let that = this;
		let dom = this.data.map((v)=>{
			if(_.isString(v)){
				return `<li>${v}</li>`
			}else {
				return `<li class="dropdownMenu-li" data-id="${v[that.idField]}">${v[that.textField]}</li>`
			}
		}).join('');
		this.$el.append(`<ul class="dropdownMenu-ul hidden">${dom}</ul>`);
		this.$ul = this.$el.find('.dropdownMenu-ul');
		this.$el.css({ position:'relative' });
		let buttonHeight = this.$button.height();
		let buttonWidth = this.$button.width();
		this.$button.off('click').on('click',function () {

		})
	}



}
