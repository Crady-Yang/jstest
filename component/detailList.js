import { BaseComponent } from './baseComponent';
import { BooleanTemplate } from './booleanTemplate';

/**
 * 根据json数据和schema，渲染实例的详情界面
 */
export class DetailList extends BaseComponent{
	/**
	 * DetailList constructor
	 * @param el
	 * @param opt
	 * @param opt.dto.type 根据数据类型渲染
	 * @param opt.dto.title 显示的键值
	 * @param opt.data
	 */
	constructor(el,opt){
		opt = opt || {};
		super(el,opt);
		this.dto = opt.dto || {};
		this.$el.addClass('detail-list')
	}

	init(data){
		let domString = '';
		let that = this;
		let list = Object.keys(data).map((k)=>{
			let v = data[k];
			let schema = that.dto[k];
			let type = that.dto[k] ? that.dto[k].type :'string';
			domString += that.getListDom(v,k,type);
		});
		this.$el.empty().append(domString);
	}

	getListDom(value,key,type){
		let f = null;
		if(type === 'boolean'){
			value = BooleanTemplate(value)
		}

		return `<div class="detail-list-item clearfix">
							<span class="pull-left keyItem">${key}</span>
							<span class="pull-right valueItem">${value}</span>
						</div>`;
	}


}
