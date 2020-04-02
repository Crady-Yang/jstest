import { createGuid } from '../common/utils'
export class BaseComponent {
  constructor(el,opt){
    opt = opt || {};
    let $el;
    if(typeof el === 'string'){
      $el = $(el)
    }else {
      $el = el
    }
    this.$el = $el;
    this.opt = opt;
    this._component_id = createGuid();

  }

}
