import { BaseComponent } from './baseComponent';
import { getLoading } from './loadingSvg';

/**
 * opt.dataSource = 返回数据的promise
 * opt.render = 渲染数据的方法
 * opt.param = 获取参数的方法，或者是静态数据
 */
export class Render extends BaseComponent{
  constructor(el,opt){
    super(el,opt);
    this.dataSource = opt.dataSource;
    this.render = opt.render;
    this.param = opt.param;
  }

  init(data){
    let height = this.$el.height();
    let loading = getLoading(height);
    let that = this;
    this.$el.empty().append(loading);
    console.log(this.render);
    console.log(this.dataSource)
    this.dataSource.then((data)=>{
      console.log(data);
      that.render(data);
    });
  }

}
