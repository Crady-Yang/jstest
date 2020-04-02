import { BaseComponent } from './baseComponent'
import { KendoWindow } from './kendo/window'
import { LoadingContainer } from './loadingContainer'
import { getOrderTag,addOrderTagMap,removeOrderTagMap } from '../controller/copyOrder/order'
import { getTagDropDownList } from '../controller/copyOrder/tag'

export class OrderTagWindow extends BaseComponent{

  constructor(el,opt){
    opt = opt ||{};
    super(el,opt);
    this.orderId = opt.orderId;
    this.type = opt.type;
    this.mode = opt.mode;
    this.projectId = opt.projectId;
    this.contentLoading = null;
    this.addLoading = null;
    this.multiSelector = null;
    this.onChange = opt.onChange; // tag 数据变化了之后
    let that = this;
    this.windowOption = Object.assign({
      title:'Manage Order Tag',
      open(){
        that.initWindow();
      }
    },opt.windowOption || {});
    this.window = new KendoWindow(this.$el,this.windowOption);

  }

  initWindow(){
    if(this.mode === 'readonly'){
      this.initReadonlyWindow()
    }else {
      this.initEditWindow()
    }
  }

  initReadonlyWindow(){
    this.$el.empty().append(`
    <div class="orderTagWindowContent">
        <div class="orderTagWindow-contentWrapper"></div>
    </div>
    `);
    this.contentLoading = new LoadingContainer(this.$el.find('.orderTagWindowContent'),{ colorType:'deep' });
    this.contentLoading.start();
    getOrderTag(this.orderId,this.type).then((data)=>{
      this.contentLoading.stop();
      this.rendTag(data);
    }).catch((err)=>{
      this.contentLoading.stop()
    })
  }

  initEditWindow(){
    this.$el.empty().append(`
    <div class="orderTagWindowContent">
        <div class="clearfix">
            <div class="pull-left" style="margin-right: 20px;width: 200px"><div class="orderTag-multiSelector"></div></div>
            <button class="pull-left k-button k-primary addTagBtn">submit</button>
        </div>
        <div class="orderTagWindow-contentWrapper" style="margin-top: 20px"></div>
    </div>
    `);
    this.contentLoading = new LoadingContainer(this.$el.find('.orderTagWindowContent'),{ colorType:'deep' });
    this.contentLoading.start();
    this.bindAddTag();
    getOrderTag(this.orderId,this.type).then((data)=>{
      this.contentLoading.stop();
      this.rendTag(data);
      let dataSource = getTagDropDownList(data).mergeQuery(()=>{
        return {
          page:1,
          pageSize:1000,
          projectId:this.projectId
        }
      }).dataSource;
      this.multiSelector = this.$el.find('.orderTag-multiSelector').kendoMultiSelect({
        dataSource:dataSource,
        dataTextField:'name',
        dataValueField:'id'
      }).data('kendoMultiSelect')
    }).catch((err)=>{
      this.contentLoading.stop()
    })
  }

  rendTag(data){
    if(this.mode === 'readonly'){
      let dom = data.map((v)=>{
        return `<span class="tagItemWrapper" style="padding: 4px 8px;margin-right: 10px;">${v.tagName}</span>`
      }).join('');
      this.$el.find('.orderTagWindow-contentWrapper').empty().append(dom)
    }else {
      let dom = data.map((v)=>{
        return `<span class="tagItemWrapper" style="padding: 4px 8px;margin-right: 10px">${v.tagName} <button class="removeTagBtn k-button k-button-xs" data-id="${v.id}"><span class="k-icon k-i-close"></span></button></span>`
      }).join('');
      this.$el.find('.orderTagWindow-contentWrapper').empty().append(dom);
      this.bindRemoveTag();
    }
  }

  bindRemoveTag(){
    let that = this;
    this.$el.find('.removeTagBtn').off('click').on('click',function () {
      let id = $(this).attr('data-id');
      removeOrderTagMap({id:[id]}).then((data)=>{
        that.initWindow();
        if(that.onChange){
          that.onChange()
        }
      })
    })
  }

  bindAddTag(){
    let that = this;
    that.addLoading = new LoadingContainer(this.$el.find('.addTagBtn'),{ ifButton:true });
    this.$el.find('.addTagBtn').off('click').on('click',function () {
      let value = that.multiSelector.value();
      that.addLoading.start();
      addOrderTagMap({
        "id": that.orderId,
        "tagIds": value,
        "type": that.type
      }).then((data)=>{
        that.addLoading.stop();
        that.initWindow();
        if(that.onChange){
          that.onChange()
        }
      }).catch((err)=>{
        that.addLoading.stop();
      })
    })
  }

  open(mode){
    this.mode = mode;
    this.window.open()
  }

  close(){
    this.window.close();
  }

}