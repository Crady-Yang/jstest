import { BaseComponent } from '../baseComponent';
import { getDefaultColumn,getFieldMapAndList } from './gridHelper';
import { deepMerge } from '../../common/deepMerge'
import {BooleanTemplate} from "../booleanTemplate";
// import {ApproveStatusObjectInstance} from "../../objectValue/copyOrder/approveStatus";
export class KendoGrid extends BaseComponent{
  /**
   * KendoGrid constructor
   * @param el
   * @param opt grid的option
   * @param opt.dto 用于生成默认的列
   */
  constructor(el,opt){
    super(el,opt);
	  this.dto = opt.dto;
	  this.timeArr=opt.timeArr||[];
    this.option = this.getDefaultOpt();
    this.instance = null;
  }

  getDefaultColumns(){
    return {
	    name:{
		    title:'名称',
		    width:''
	    },
		localIndex:{
	    	title:'序号',
			width:80,
			template:function(e){
	    		let id=e.id;
	    		return _.findIndex(e.parent(),function (o) {return o.id===id})+1
			},
			filterable:false
		},
		isEnabled:{
		    title:'启用',
		    template:function (data) {
			    return BooleanTemplate(data.isEnabled)
		    },
		    width:100
	    },
		isSystem:{
			title:'系统默认',
			template:function (data) {
				return BooleanTemplate(data.isSystem)
			},
			width:100
		},
		published:{
			title:'发布',
			template:function (data) {
				return BooleanTemplate(data.published)
			},
			width:100
		},
	    creationTime:{
		    format: "{0: yyyy-MM-dd HH:mm:ss}",
		    width:150,
		    filterable: {
			    extra: true,
				ui: "datetimepicker",
			    messages: {
                    info: "请选择开始时间和结束时间"
			    },
					operators: {
						date: {
                            gt: "开始时间",
                            lt: "结束时间"
						}
					},
		    }
	    },
		submitQcTime:{
			format: "{0: yyyy-MM-dd HH:mm:ss}",
			width:150,
			filterable: {
				extra: true,
				messages: {
                    info: "请选择开始时间和结束时间"
				},
				ui: "datetimepicker",
				operators: {
					date: {
                        gt: "开始时间",
                        lt: "结束时间"
					}
				},
			}
		},
	    finishTime:{
		    format: "{0: yyyy-MM-dd HH:mm:ss}",
		    width:150,
		    filterable: {
			    extra: true,
			    messages: {
                    info: "请选择开始时间和结束时间"
			    },
				ui: "datetimepicker",
				operators: {
					date: {
                        gt: "开始时间",
                        lt: "结束时间"
					}
				},
		    }
	    },
	    innerDeadLineTime:{
		    format: "{0: yyyy-MM-dd HH:mm:ss}",
		    width:150,
			filterable: false
	    },
		innerDeadlineTime:{
			format: "{0: yyyy-MM-dd HH:mm:ss}",
			width:150,
			filterable: false
		},
	    outerDeadLineTime:{
		    format: "{0: yyyy-MM-dd HH:mm:ss}",
		    width:150,
		    filterable: false
	    },
	    assignAssignerTime:{
		    format: "{0: yyyy-MM-dd HH:mm:ss}",
		    width:150,
		    filterable: {
			    extra: true,
				ui: "datetimepicker",
			    messages: {
				    info: "请选择开始时间和结束时间"
			    },
				operators: {
					date: {
                        gt: "开始时间",
                        lt: "结束时间"
					}
				},
		    }
	    },
	    assignStaffTime:{
		    format: "{0: yyyy-MM-dd HH:mm:ss}",
		    width:150,
		    filterable: {
			    extra: true,
				ui: "datetimepicker",
			    messages: {
                    info: "请选择开始时间和结束时间"
			    },
				operators: {
					date: {
                        gt: "开始时间",
                        lt: "结束时间"
					}
				}
		    }
	    },

    };
  }

	getColumnsByDto() {
    let dto = this.dto;
    let columnCollection = this.getDefaultColumns();
		if(!dto){
			let t = [];
			for(let k in columnCollection){
				let field = columnCollection[k];
				t.push(Object.assign({field:k},field));
			}
			return t;
		}
		let final = [];
		for(let k in dto){
			let field = columnCollection[k];
			if(field){
				field.field = k;
				final.push(field);
			}else{
				final.push({
					title:k,
					field:k
				})
			}
		}
		return final
	}

	/**
   * 根据dto拿到的列和option传进来的列，用相同field的时候，去option传进来的列
   * 合并dto拿到的列和option传进来的列
   * 传进来的列中的某个属性的值为null的时候，表示禁止默认列
	 */
	getColumn(){
    let dtoColumns = this.getColumnsByDto();
		let optColumns = this.opt.columns || [];
    // let dtoFieldMapList = getFieldMapAndList(dtoColumns);
    // let optFieldMapList = getFieldMapAndList(optColumns);
    // let finalList = _.uniq(dtoFieldMapList.list.concat(optFieldMapList.list));
    // let final = [];
    // for(let i=0;i<finalList.length;i++){
    //   let t = finalList[i];
    //   let dto = dtoFieldMapList.map[t];
    //   let opt = optFieldMapList.map[t];
    //   let f = {};
    //   // 同时存在，合并
    //   if(dto && opt){
    //     f = Object.assign({},dto,opt);
    //   }else if(!dto && opt){
    //     f = opt
    //   }else {
    //     f = dto
    //   }
    //   final.push(f);
    // }
    let final = optColumns.map((t)=>{
	    let field = t.field;
	    let dto = _.filter(dtoColumns,{ field })[0];
	    if(dto){
        return Object.assign(dto,t)
	    }else {
	      return t
      }
    });
    return final;
  }

  getDefaultOpt(){
    let column = this.getColumn();
    let timeArr=this.timeArr;
    //检测dtoColumn
    let defaultOpt = {
      allowCopy: true,
      resizable:true,
		 //filterMenuInit:function (e) {
		 //	menuInit(timeArr,e)
		 //},
      columnResizeHandleWidth:10, //列与列之间出现调整分隔符号的范围
      filterable: {
        extra: false,
	  	operators: {
		  string: {
			  eq: "包含"
		  },
		  number: {
			  eq: "大于等于"
		  },
		  select:{
			  eq: "等于"
		  }
	  },
        //做多语言时配置
          messages: {
              info:"筛选条件：",
              and: "且",
              or: "或",
              filter: "筛选",
              clear: "清除筛选"
          }
      },
      operators: {
        //做多语言时配置
        date: {
              gt: "开始时间",
              lt: "结束时间"
        }
      },
      height:'50rem',
      //做多语言时配置
      messages:{},
      //做多语言时配置
      noRecords: {
          template: function () {
              return `<span class="noRecord">暂无数据~</span>`
          }
      },
      pageable:{
	      pageSizes: [10, 30, 50,500],
	      numeric: true,
        refresh:true,
				messages: {
                    display: "第{0}页，共{2:n0}条数据"
				}
      }
    };
    let final = deepMerge(defaultOpt,this.opt);
    final.columns = column;
    return final
  }

  init(){
    if(!this.instance){
      console.log('------ grid option ----------');
      console.log(this.option);
      this.instance = this.$el.kendoGrid(this.option).data("kendoGrid");
    }else {
	    this.instance.dataSource.read()
    }
  }

  update(opt){
    this.opt = opt;
    this.option = this.getDefaultOpt();
    this.instance = null;
    this.init();
  }

  getSelected(){
	  let selectedRows = this.instance.select();
	  let selectItem = [];
	  for (let i = 0; i < selectedRows.length; i++) {
		  let dataItem = this.instance.dataItem(selectedRows[i]);
		  selectItem.push(dataItem);
	  }
	  return selectItem
  }

  destroy(){
	  this.instance.destroy();
	  this.$el.empty();
  }
}

