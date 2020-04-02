import { BaseComponent } from './baseComponent';
import { LoadingContainer } from './loadingContainer';
import { RoleNameMap } from './kendo/roleNameMap';
import { ValidationOption } from './kendo/validationOption';
import { deepMerge } from '../common/deepMerge';

//"string","number","boolean","date","object"
let inputTypeMap = {
  'string':'text',
  'number':'number',
  'boolean':'text',
  'date':'text',
  'object':'text'
};

const validationList = ['email','tel','url'];
let ignoreComponent = ['upload'];

/*
 * 表单中的存在name属性的数据才会被探测到
 * 提交按钮需要加上data-submit属性，绑定点击触发loading
 * 需要在kendo组件初始化之后执行
 */
export class Form extends BaseComponent{
  constructor(el,opt){
	  opt = opt || {};
	  opt.validation = opt.validation || {};
    super(el,opt);
    this.$button = this.$el.find('[data-submit]').eq(0);
    this.$input = this.$el.find('[name]');
    this.validation = this.getValidationOption();
    this.$validator = null;
    this.dto = opt.dto;
    if(this.$button){
      this.submitButton = new LoadingContainer(this.$button,{ ifButton:true })
    }
    // onSubmit 是个return promise的function
    this.onSubmit = opt.onSubmit || function () {};
    this.style = opt.style || 'block';  //block = label和input分两行；inline = label和input在同一行
    this.initValidation();
    this.initSubmit();
    this.initStyle();
  }

  getValidationOption(){
    let t = deepMerge(ValidationOption,this.opt.validation, {
      mode:{
	      validateInput:'after',
	      validate:'after'
      }
    });
    return t;
  }

  initStyle(){
	  //for(let i=0;i<this.$input.length;i++){}
    this.$el.addClass('lw-form');
    if(this.style === 'inline'){
      this.$el.addClass('inlineForm')
    }
  }

  initValidation(){
    if(this.dto){
      for(let i=0;i<this.$input.length;i++){
        let $t = this.$input.eq(i);
        let thisName = $t.attr('name');
          let thisField = this.dto[thisName];
        if(thisField){
          let thisValidation = thisField.validation || {
              type:thisField.type,
              required:thisField.required,
              pattern:thisField.pattern,
              min:thisField.min,
              max:thisField.max
          };
          let inputType = thisValidation && thisValidation.type ? thisValidation.type : inputTypeMap[thisField.type] || 'text';
          //dom 上的原始验证类型可覆盖DTO上的验证类型
          let orgType = $t.attr('type');
          if(inputType && !orgType){
            $t.attr('type',inputType)
            }
            if (thisValidation.required) {
                $t.attr('required', true);
                this.$el.find(`label[for="${thisName}"]`).addClass('required');
            } else {
                $t.removeAttr('required');
                this.$el.find(`label[for="${thisName}"]`).removeClass('required');
            }
          if(thisValidation.pattern && !$t.attr('pattern') ){
            $t.attr('pattern',thisValidation.pattern)
          }
          if(typeof thisValidation.min === 'number' && !$t.attr('min') ){
            $t.attr('min',thisValidation.min)
          }
          if(typeof thisValidation.max === 'number' && !$t.attr('max')){
            $t.attr('max',thisValidation.max)
          }
        }
      }
    }
    this.$validator = this.$el.kendoValidator(this.validation).data("kendoValidator");
    return this
  }

  getValue(){
    let valueCollection = {};
    let $inputs = this.$el.find('[name]');
    for(let i=0;i<$inputs.length;i++){
      let $t = $inputs.eq(i);
      let name = $t.attr('name')
      //检测是否是kendo组件
      let role = $t.attr('data-role');
      if(role){
        if(ignoreComponent.indexOf(role) < 0&&role!='menu'){
	        let kendoComponent = RoleNameMap[role];
	        if(!kendoComponent){
		        throw new Error(`${role} not registe`);
		        return
	        }else {
                if(role==='datepicker'||role==='datetimepicker'){
                    valueCollection[name] = $t.val();
                }else{
                    let kendoInstance = $t.data(kendoComponent);
                    valueCollection[name] = kendoInstance.value();
                }
	        }
        }
      } else {
        // 不是kendo组件的话，根据标签类型取值
        let value;
        if($t.is('input[type=checkbox]')){
          value = $t.prop('checked')
        }else {
          value = $t.val();
        }
        valueCollection[name] = value;
      }
    }
    return valueCollection
  }
  
  // 表单的值作为筛选值时，空字符的数据将被过滤掉，不作为筛选
  getExistValue() {
    let value = this.getValue();
    for(let k in value){
      if(typeof value[k] === 'string' && value[k].length === 0){
        delete value[k]
      }
    }
    return value;
  }
  

  //value的键值需要和表单上的name属性对应
  setValue(value){
    if(typeof value !== 'object'){
      throw new Error('setValue required object type')
    }
    for(let i=0;i<this.$input.length;i++){
      let $t = this.$input.eq(i);
      //console.log($t);
      let name = $t.attr('name');
      // console.log(name);

      let thisValue = value[name]
      if(thisValue !== undefined){
	      let role = $t.attr('data-role');
	      if(role){
		      if(ignoreComponent.indexOf(role) < 0){
			      let kendoComponent = RoleNameMap[role];
			      if(!kendoComponent){
				      throw new Error(`${role} not registe`);
				      return
			      }else {
				      let kendoInstance = $t.data(kendoComponent);
				      // console.log(`name:${name}`);
				      // console.log(`value:${thisValue}`);
				      kendoInstance.value(thisValue)
			      }
		      }
          } else {
              //如果是图片
            if ($t[0].tagName === "IMG") {
                $t.attr("src", `../${thisValue}`)
            }
	      	let type = $t.attr('type');
	      	if(type === 'checkbox'){
	      		// console.log('---- checkbox ----');
	      		// console.log($t);
	      		// console.log(thisValue);
	      		$t.prop('checked',thisValue)
		      }else {
			      $t.val(thisValue)
		      }
          }
          
      }
    }
  }

  initSubmit(){
    let that = this;
    console.log('---- initSubmit -----')
    console.log(this.$button);
    this.$button.on('click',function () {
      let value = that.getValue();
      console.log(value);
      let ifValid = that.validate();
      if(ifValid){
        that.submitButton.start();
	      //that.$button.removeAttr('disabled');
          // that.onSubmit().then((data)=>{
          //     that.cancelLoading();
          //     that.clearForm();
          // }).catch((err)=>{
          //     that.cancelLoading();
          // });
          that.onSubmit();
	      return true
      }else {
	      //that.$button.attr('disabled','disabled');
	      return false
      }
    })
  }

  //清除表单内容，包括kendo组件
  clearForm(){
	  for(let i=0;i<this.$input.length;i++){
		  let $t = this.$input.eq(i);
		  let name = $t.attr('name');
		  //检测是否是kendo组件
		  let role = $t.attr('data-role');
		  if(role){
			  if(ignoreComponent.indexOf(role) < 0){
				  let kendoComponent = RoleNameMap[role];
				  if(!kendoComponent){
					  throw new Error(`${role} not registe`);
					  return
				  }else {
					  let kendoInstance = $t.data(kendoComponent);
					  kendoInstance.value('');
				  }
        }
		  }else {
			  // 不是kendo组件的话，根据标签类型取值
			  if(!$t.is('input[type=checkbox]')){
				  $t.val('');
			  }
		  }
	  }
  }

  cancelLoading(){
    this.submitButton.stop();
  }

  validate(){
  	let t = this.$validator.validate();
  	if(!t){
  		this.$validator.errors().map((v)=>{
			  console.error(v)
		  });
	  }
    return t

  }
    changeDto(opt) {
        this.dto = opt.dto
        this.initValidation()
    }
}
