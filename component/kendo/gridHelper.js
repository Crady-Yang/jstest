import { BooleanTemplate } from '../booleanTemplate'

// title 可做多语言
let columnCollection = {
  name:{
    title:'Name',
    width:''
  },
  enabled:{
    title:'Enabled',
    template:function (data) {
      return BooleanTemplate(data.enabled)
    },
    width:100
  },
	creationTime:{
		format: "{0: yyyy-MM-dd HH:mm:ss}",
		width:150
  },
	finishTime:{
		format: "{0: yyyy-MM-dd HH:mm:ss}",
		width:150
  },
	innerDeadLineTime:{
		format: "{0: yyyy-MM-dd HH:mm:ss}",
		width:150
  },
	outerDeadLineTime:{
		format: "{0: yyyy-MM-dd HH:mm:ss}",
		width:150
	},
	assignAssignerTime:{
		format: "{0: yyyy-MM-dd HH:mm:ss}",
		width:150
  },
	assignStaffTime:{
		format: "{0: yyyy-MM-dd HH:mm:ss}",
		width:150
  }
};

/**
 * 从默认列的集合中选出列，如果不存在于默认集合中，就生成新的基本列
 * @param dto
 * @returns {Array}
 */
export function getDefaultColumn(dto) {
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

export function getFieldMapAndList(colums) {
  let map = {};
  let list = [];
  for(let i=0;i<colums.length;i++){
    let t = colums[i];
    let f = t.field;
    if(f){
	    map[f] = t;
	    list.push(f)
    }
  }
  return {
    map,
    list
  }
}
