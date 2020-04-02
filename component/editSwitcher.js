import { BaseComponent } from './baseComponent';

class EditSwitcher extends BaseComponent{
	/**
	 * 用于切换detail view和编辑界面的开关
	 * @param el
	 * @param opt.detailView detailView组件的实例
	 * @param opt.editForm
	 */
	constructor(el,opt){
		super(el,opt);
		this.detailView = opt.detailView;
		this.editForm = opt.editForm;
		this.status = 'detail'; // 默认显示detail视图
		this.detailView.$el.removeClass('hidden');
		this.editForm.$el.addClass('hidden');
		let that = this;
		this.$el.on('click',function () {
			that.switch();
		})
	}

	switch(){
		if(this.status === 'detail'){
			this.detailView.$el.addClass('hidden');
			this.editForm.$el.removeClass('hidden');
			this.status = 'edit';
		}else {
			this.detailView.$el.removeClass('hidden');
			this.editForm.$el.addClass('hidden');
			this.status = 'detail';
		}
	}
}
