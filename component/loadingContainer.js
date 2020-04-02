import { BaseComponent } from './baseComponent';
import { getLoading } from './loadingSvg'
import { ThemeColor } from '../common/theme'

export class LoadingContainer extends BaseComponent{
  constructor(el,opt){
    super(el,opt);
    opt = opt || {};
    this.colorType = opt.color; //浅色还是深色  deep or ligth
    let defaultColor = opt.colorType === 'deep' ? ThemeColor["title-h"] : '#fff';
	  this.color = opt.color || defaultColor;
    this.size = opt.size || this.$el.height() -10;
    this.empty = opt.empty; //empty = true时，会清空原来的内容
    this.ifButton = opt.ifButton; // = true的时候，会把button禁用
  }

  start(){
    let svg = getLoading(this.size,this.color);
    let dom = `
      <span>
        ${svg}
      </span>
    `;
	  this.$el.children().addClass('hidden-i');
	  this.$el.prepend(dom);

    if(this.ifButton){
      this.$el.attr('disabled','disabled');
    }
  }

  stop(){
    this.$el.find('svg[data-type="loading"]').remove();
	  this.$el.children().removeClass('hidden-i');
    if(this.ifButton){
      this.$el.removeAttr('disabled');
    }
  }
}
