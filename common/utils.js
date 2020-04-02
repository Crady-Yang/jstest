import { InnerError } from './exception'

export function getUrlparams(key) {
  // 获取URL中?之后的字符
  let str = decodeURIComponent(window.location.href);
  if(str.indexOf('?') < 0 ){
    return null
  }
  str = str.split('?')[1]
  // 以&分隔字符串，获得类似name=xiaoli这样的元素数组
  let arr = str.split("&");
  let obj = {}

  // 将每一个数组元素以=分隔并赋给obj对象
  for (let i = 0; i < arr.length; i++) {
    let index = arr[i].indexOf('=') + 1;
    let content = arr[i].substring(index);
    let tmp_arr = arr[i].split("=");
    obj[tmp_arr[0]] = content;
  }
  return obj[key];
}

//判断是否为键值对
export function isKeyValue(obj) {
  if (typeof obj === 'object' && !_.isArray(obj) && !_.isFunction(obj) && obj !== null) {
    return true
  }
  return false
}

export function before(orgFn, addFn) {
  if (!_.isFunction(orgFn)) {
    return orgFn;
  }
  if (_.isFunction(addFn)) {
    return function (...arg) {
      let addFnData = addFn.apply(this, arg);
      arg = [addFnData].concat(arg);
      let org = orgFn.apply(this,arg);
      //let finalData = Object.assign({}, org, addFnData);
      return org;
    }
  } else {
    return orgFn;
  }
}

//在之后添加函数
export function after(orgFn, addFn) {
  if (!_.isFunction(orgFn)) {
    return orgFn;
  }
  if (_.isFunction(addFn)) {
    return function (...arg) {
      let org = orgFn.apply(this, arg);
      arg = [org].concat(arg)
      //第一个参数是原来那个函数的返回值，第二个参数开始是原始参数
      let addFnData = addFn.apply(this,arg);
      //let finalData = Object.assign({}, org, addFnData);

      return addFnData;
    }
  } else {
    return orgFn;
  }
}


/**
 * 移除继承字段，方法字段，Vue对象字段
 * @param obj
 */
export function clearObject(obj) {
  let final = {};
  for(let k in obj){
    if(obj.hasOwnProperty(k) &&  !_.isFunction(obj[k]) ){
      final[k] = obj[k]
    }
  }
  return final
}


/**
 * 从对象总选取需要的建值
 */
export function include(obj,keyList) {
  //不传值的话就是所有字段
  if(!keyList || keyList.length === 0){
    return obj
  }
  let final = {}
  for(let i =0 ;i < keyList.length;i++){
    let v = keyList[i]
    final[v] = obj[v]
    if( obj[v] === undefined){
      console.error(`unknown fields ${ v }`)
    }
  }
  return final
}

/**
 * 从对象中排除指定的建值
 */
export function except(obj,keyList) {

}

export function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

/**
 * 过滤特殊字符
 * @param str
 */
export function scriptFilter(str,reg) {
  return str ? str.replace(reg || /[&<>](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function (a, b) {
    if (b) {
      return a;
    } else {
      return {
        '<': '&lt;',
        '&': '&amp;',
        //'"': '&quot;',
        '>': '&gt;',
        //"'": '&#39;',
      }[a]
    }
  }) : '';
}

export function decodeHtmlTag(str) {
  let s = "";
  if(str.length == 0) return "";
  s = str.replace(/&amp;/g,"&");
  s = s.replace(/&lt;/g,"<");
  s = s.replace(/&gt;/g,">");
  s = s.replace(/&nbsp;/g," ");
  s = s.replace(/&#39;/g,"\'");
  s = s.replace(/&quot;/g,"\"");
  return s;
}

export function parseScript(str) {
  if(typeof str === 'string'){
    return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  }else {
    return str
  }
}

/**
 * 过滤首尾标签
 * @param string
 */
export function trimFilter(string) {
  if(typeof trimFilter !== 'string'){
    return string
  }
  //去除字符串右边的空格
  let j = string.length - 1
  for (j; j >= 0 && string.charAt(j) <= " " ; j--) {
    ;
  };
  string = string.substring(0, j + 1);
  //去除字符串左边的空格
  let k = 0
  for (k; string.length && string.charAt(k) <= " " ; k++) {
    ;
  };
  string = string.substring(k, string.length);

  return string;
}

export function isJson(value) {
  return toString.call(value) === '[object Object]';
}

/**
 * 比较a,b两个对象，或者数组对象
 * 只比较string，array，Boolean
 * @param a
 * @param b
 * @param opt
 * @param opt e.g { key:['name'] }
 */
export function diff(a,b,opt) {
  if(_.isArray(opt)){
    opt = { key:opt }
  }
  opt = opt || {}
  let defaultOpt = {
    key:[]  //需要比较的字段，如果为空数组，就以a对象为标准
  }
  opt = Object.assign(defaultOpt,opt)
  if(isJson(a) && isJson(b)){
    return diffObject(a,b,opt)
  }
  if(_.isArray(a) && _.isArray(b)){
    if(isJson(a[0]) && isJson(b[0])){
      return diffObjectArray(a,b,opt)
    }
    if(!isJson(a[0]) && !isJson(b[0])){
      return diffArray(a,b,opt)
    }

  }
  throw new InnerError({ message:'diff params invalid' })
}

function _formatDiffObject(obj,opt) {
  obj = clearObject(obj)
  let keyList = opt.key
  let t = {}
  for(let i=0;i<keyList.length;i++){
    let k = keyList[i]
    t[k] = obj[k]
  }
  return t
}

/**
 *
 * @param a
 * @param b
 * @param opt {idKey:'id',key:[],addFn:function(org,current){},removeFn:function(org,current){}}
 * addFn:当找到相同IdKey的值之后，判断其他值的数据，返回boolean，返回true的话，current的数据会被加入到add结果中
 * removeFn:当找到相同IdKey的值之后，判断其他值的数据，返回boolean，返回true的话，org的数据会被加入到remove结果中
 */
export function diffObjectArray(a,b,opt) {
  opt = Object.assign({},{
    idKey:'id'
  },opt);
  opt.key = opt.key || [];
  let add = [];
  let remove = [];
  let update = [];
  //以a为源，对比得到a[idKey]存在，b[idKey]不存在的项
  add1:
    for(let i=0;i<a.length;i++){
      let a_i = a[i][opt.idKey];
      let ifHas = false;
      let ifRemove = false;
      add2:
        for(let j=0;j<b.length;j++){
          let b_i = b[j][opt.idKey];
          if(a_i === b_i){
            ifHas = true;
            if(opt.removeFn){
              // console.log('------- a -------')
              // console.log(a[i])
              // console.log('-------- b ---------')
              // console.log(b[j])
              ifRemove = opt.removeFn(a[i],b[j]);

            }
            // 存在的话，对比a,b两个对象
            let result = diffObject(a[i],b[j],opt);
            if(!(result.add === {} && result.update === {} && result.remove === [])){
              update.push(b[j])
            }
            break add2
          }
        }
      if(!ifHas || ifRemove){
        remove.push(a[i])
      }
    }

  //以b为源，对比得到b[idKey]存在，a[idKey]不存在的项
  remove1:
    for(let i=0;i<b.length;i++){
      let b_i = b[i][opt.idKey]
      let ifHas = false
      let ifAdd = false
      remove2:
        for(let j=0;j<a.length;j++){
          let a_i = a[j][opt.idKey]
          if(a_i === b_i){
            ifHas = true
            if(opt.addFn){
              ifAdd = opt.addFn(b[i],a[i])
            }
            break remove2
          }
        }
      if(!ifHas || ifAdd){
        add.push(b[i])
      }
    }
  return{
    add,
    update,
    remove
  }

}

export function diffObject(a,b,opt) {
  // console.log(a)
  // console.log(b)
  a = _formatDiffObject(a,opt)
  b = _formatDiffObject(b,opt)
  let add = {}
  let update = {}
  let remove = []
  // console.log(a)
  // console.log(b)
  for(let k in a){
    let a_v = a[k]
    let b_v = b[k]
    if(b_v === undefined || b_v === null || b_v === NaN){
      remove.push(k)
    }else if(b_v != a_v){
      // console.log(b_v)
      // console.log(a_v)
      update[k] = b_v
    }
  }
  for(let k in b){
    let a_v = a[k]
    let b_v = b[k]
    // console.log(k)
    // console.log(a_v)
    if(a_v === undefined || a_v === null || a_v === NaN){
      add[k] = b_v
    }
  }
  return {
    add,
    update,
    remove
  }
}

export function diffArray(a,b) {
  //a = a.map((v)=>{ return _formatDiffObject(v) })
  //b = b.map((v)=>{ return _formatDiffObject(v) })

  let add = []
  let remove = []
  //以a为源，对比得到a存在，b不存在的项
  for(let i=0;i<a.length;i++){
    let a_i = a[i]
    let ifHas = false
    for(let j=0;j<b.length;j++){
      let b_i = b[j]
      if(a_i === b_i){
        ifHas = true
      }
    }
    if(!ifHas){
      remove.push(a_i)
    }
  }

  //以b为源，对比得到b存在，a不存在的项
  for(let i=0;i<b.length;i++){
    let b_i = b[i]
    let ifHas = false
    for(let j=0;j<a.length;j++){
      let a_i = a[j]
      if(a_i === b_i){
        ifHas = true
      }
    }
    if(!ifHas){
      add.push(b_i)
    }
  }
  return{
    add,
    remove
  }
}


/*
 * 格式化成tree的数据格式
 * @opt.level 递归层数
 * @opt.selfKey 数据的id键值
 * @opt.parentKey 父级id键值
 * @opt.newKey  需要生成的sub的键值
 * @data  原始数据
 * formatTreeData([{id:1,name:"father",parentId:0},{id:2,name:"children",parentId:1}],{ level:1,selfKey:'id',parentKey:'parentId',newKey:'sub' })
 *  => [{id:1,name:"father",parentId:0,sub:[{id:2,name:"children",parentId:1}]}]
 */
export function formatTreeData(data, opt) {
  if (!data) {
    throw new InnerError({ message:'data is required' })
  }
  if(!_.isArray(data)){
    throw new InnerError({ message:'data required array type' })
  }
  if(data.length === 0){
    return []
  }
  let level = opt.level || 3
  let selfKey = opt.selfKey || 'id'
  let parentKey = opt.parentKey || 'parentId'
  let newKey = opt.newKey || 'children'


  let temp = {},
      final = [];

  //如果父级ID不存在，替换parentID = 0
  data = data.map((v)=>{
    if(!v[parentKey]){
      v[parentKey] = '0'
    }
    return v
  })


  let treeRecursion = function (key, data) {
    if (!data) {
      return
      }
    for (let i = 0; i < data.length; i++) {
      //consoleLog(key);
      //consoleLog(data[i][selfKey]);
      if (String(key) === String(data[i][selfKey])) {
        if (!data[i][newKey]) {
          data[i][newKey] = [];
        }
        data[i][newKey] = temp[key];
        return;
      } else {
        if (data[i][newKey]) {
          treeRecursion(key, data[i][newKey]);
        }
      }
    }
  };

  //找到父级 parentID =NULL / 0
  for (let i = 0; i < data.length; i++) {
    // consoleLog(data[i]);
    if (!data[i][parentKey] || data[i][parentKey] === '0' || data[i][parentKey] === '00000000-0000-0000-0000-000000000000') {
      final.push(data[i]);
    } else {
      if (!temp[data[i][parentKey]]) {
        temp[data[i][parentKey]] = [];
      };
      temp[data[i][parentKey]].push(data[i]);
    };
  };

  //consoleLog('treeRecursion');

  //consoleLog(final);
  //consoleLog(temp);

  for (let j = 0; j < level - 1; j++) {
    for (let key in temp) {

      treeRecursion(key, final);

    };
  };
  //console.warn(final);
  console.log(final);
  return final;
}

//判断是否是时间列
export function contains(arr, obj) {
  let i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
}

export function menuInit(timeArr,e){
  e.container.data("kendoPopup").bind("open", function () {
    //bind to the open of the filter menu popup
    if(contains(timeArr, e.field)) {
      // let beginOperator = e.container.find("[data-role=dropdownlist]:eq(0)").data("kendoDropDownList");
      // beginOperator.value("gt");
      // beginOperator.trigger("change");
      // let endOperator = e.container.find("[data-role=dropdownlist]:eq(2)").data("kendoDropDownList");
      // endOperator.value("lt");
      // endOperator.trigger("change");
      // console.log(e);
      // console.log(e.find('.k-dropdown'));
      // e.container.find(".k-dropdown").hide();
      // e.find('.k-filter-menu-container')
      console.log( e.container.find('input[title="Value"].k-input'))
      // let start = e.container.find('[data-role=dropdownlist]:eq(0)').kendoDateTimePicker({
      //   format: "yyyy/MM/dd hh:mm tt",
      //   timeFormat: "HH:mm"
      //   }).data("kendoDateTimePicker");
      // start.value("gt");
      // let end = e.container.find('[data-role=dropdownlist]:eq(2)').kendoDateTimePicker({
      //     format: "yyyy/MM/dd hh:mm tt",
      //     timeFormat: "HH:mm"
      //   }).data("kendoDateTimePicker");
      // end.value("lt");
      // e.container.find('span[aria-label="select"]').hide();
      // e.container.find(".k-dropdown").hide();
      // e.container.find(".k-datetimepicker").next().hide();
    }
  });
}

//转化带T的时间
export function timeTFormatter(data){

  if(data === '0001-01-01T00:00:00'){
    return ''
  }

  if(data){
    try {
      return moment(data).format('YYYY-MM-DD HH:mm:ss')
    }catch (e) {
      return 'unknown time data'
    }
  }else {
    return ''
  }
}
//不带时间
export function timeTFormatterWithoutTime(data){

  if(data === '0001-01-01T00:00:00'){
    return ''
  }

  if(data){
    try {
      return moment(data).format('YYYY-MM-DD')
    }catch (e) {
      return 'unknown time data'
    }
  }else {
    return ''
  }
}


//转化数据结构
    //转化数据
export  function transformData(ary,opt) {
    let parentCategoryId='parentId';
    let name='name';
    let data =(function (ary) {
        let tempAry = [];
        let idList = [];
        $.each(ary, function(item, i){
            idList.push(item.id)
        });

    function deb(id, idList) {
        let flag = true;
        for (let ida in idList) {
            if (id == idList[ida]) {
                flag = false;
            }
        }
        return flag;
    }
    for (let i = 0, len = ary.length; i < len; i++) {
        if (ary[i][parentCategoryId]== undefined || (ary[i][parentCategoryId]!= undefined && deb(ary[i][parentCategoryId], idList))) {
            let obj = {
                name: ary[i][name], id: ary[i].id
            };
            tempAry.push(obj);
        }
    }
      return tempAry;
  }(ary));

      let temp = 0;
      if (data.constructor == Array) {
          for (let i = 0, len = data.length; i < len; i++) {
              for (let j = 0, lenA = ary.length; j < lenA; j++) {
                  if (ary[j].parentCategoryId == data[i].id) {
                      let obj = {
                          name: ary[j][name], id: ary[j].id
                      };
                      data[i].items = data[i].items || [];
                      data[i].items.push(obj); temp++;
                  }
              }
          }
      }
      if (temp > 0) {
          if (data.constructor == Array) {
              for (let n = 0, lenB = data.length; n < lenB; n++) {
                  data[n].items = this.transformData(ary, data[n].items ? data[n].items : []);
                  if (data[n].items.length == 0) {
                      delete data[n].items;
                  }
                  //delete data[n].ID;
              }
          }
      } else {
          for (let n = 0, lenB = data.length; n < lenB; n++) {
              //delete data[n].ID;
          }
      }
      return data;
  }

export  function transformDataTree(ary,opt) {
  let parentCategoryId=opt.parent||'parentId';
  let id=opt.child||'id'
  let data =(function (ary) {
    let tempAry = [];
    let idList = [];
    $.each(ary, function(item, i){
      idList.push(item[id])
    });

    function deb(id, idList) {
      let flag = true;
      for (let ida in idList) {
        if (id == idList[ida]) {
          flag = false;
        }
      }
      return flag;
    }
    for (let i = 0, len = ary.length; i < len; i++) {
      if (ary[i][parentCategoryId]== undefined || (ary[i][parentCategoryId]!= undefined && deb(ary[i][parentCategoryId], idList))) {
        // let obj = {
        //   name: ary[i][name], id: ary[i][id]
        // };
        tempAry.push(ary[i]);
      }
    }
    return tempAry;
  }(ary));

  let temp = 0;
  if (data.constructor == Array) {
    for (let i = 0, len = data.length; i < len; i++) {
      for (let j = 0, lenA = ary.length; j < lenA; j++) {
        if (ary[j][parentCategoryId] == data[i][id]) {
          // let obj = {
          //   name: ary[j][name], id: ary[j].id
          // };
          data[i].items = data[i].items || [];
          data[i].items.push(ary[j]); temp++;
        }
      }
    }
  }
  if (temp > 0) {
    if (data.constructor == Array) {
      for (let n = 0, lenB = data.length; n < lenB; n++) {
        data[n].items = transformDataTree(ary, data[n].items ? data[n].items : []);
        if (data[n].items.length == 0) {
          delete data[n].items;
        }
        //delete data[n].ID;
      }
    }
  } else {
    for (let n = 0, lenB = data.length; n < lenB; n++) {
      //delete data[n].ID;
    }
  }
  return data;
}
  //除去首尾字符
  //s 要处理的字符串
  //char 要过滤掉的字符
  export function trimChar(s,char) {
	  let fs = s.substring(0,1);
	  let ls = s.substring(s.length-1);
	  if(fs === char){
		  s = s.substring(1);
	  }
	  if(ls === char){
		  s = s.substring(0,s.length -1);
	  }
	  return s;
  }


export function removeHtml (string) {
	let start_ptn = /<\/?[^>]*>/g;      //过滤标签开头
	let end_ptn = /[ | ]*\n/g;            //过滤标签结束
	let space_ptn = /&nbsp;/ig;          //过滤标签结尾

	return string.replace('<br>', "").replace('<br/>', "").replace('<br />', '').replace(start_ptn, "").replace(end_ptn).replace(space_ptn, "");

}

/**
 * 根据key键值合并Source和target
 * @param key 键值 e.g id
 * @param source array
 * @param target array
 * @returns {*}
 * collect_merge('id',[{ id:1,name:doris1 }],[{ id:1,name:doris2,age:18 }])
 * => [{ id:1,name:doris2,age:18 }]
 */
export function collect_merge(key,source,target) {
	if(!_.isArray(source)){
		throw Error('collect_merge required source array type' )
	}
	if(source.length === 0){
	  return []
  }
	let final = source.map((value)=>{
	  if(!isJson(value)){
	    throw Error('collect_merge require Array<Object>')
    }
		let v = value[key];
		if(v === undefined || v === null){
			throw Error(`collect_merge ${key} is required`)
		}
		let t = _.filter(target,{ [key]:v });
		if(t.length){
			value = Object.assign({},value,t[0])
		}
		return value
	});
	return final
}

export function ifCnString(s) {
  let reg = /^[\u4e00-\u9fa5]$/;
  if (reg.test(s)) {
    return true;
  } else {
    return false;
  }
}

export function ifCnPunctuation (s) {
  let reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
  if (reg.test(s)) {
    return true;
  } else {
    return false;
  }
}

export function getMaxInArray(array) {
  let max = 0;
  for (let i = 0; i < array.length; i++){
    let n = array[i];
    if (typeof n === 'number' && max < n) {
      max = n;
    }
  }
  return max;
}


function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function createGuid() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

//根据字段排序
export function sortByKey(array, key, order) {
  if (!key || !array) {
    return false;
  };
  let final = [];
  order = order || 'acs';

  if (isArray(array)) {
    final = array.sort(function (a, b) {
      if (order === 'acs') {
        return a[key] - b[key];
      };
      if (order === 'des') {
        return b[key] - a[key];
      };
    });
  };

  return final;
};


//数组对象去重
export function deduplication(arr){
  let obj = {};
  arr = arr.reduce(function(item, next) {
    obj[next.targetId] ? '' : obj[next.targetId] = true && item.push(next);
    return item;
  }, []);
  return arr;

}

export function downloadFile(blob,fileName) {
  let url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName);
  a.click();
  URL.revokeObjectURL(url);
}

export function jsonParse (data) {

  if (typeof data === 'null') {
    return '';
  }
  // json
  let ifJson = true;

  try{
    JSON.parse(data);
  } catch (e) {
    ifJson = false;
  }
  if (ifJson) {
    data = JSON.parse(data);

    if (data && data['rows']) {
      data = data['rows']
    }
    return data;
  }
  //未返回
  if (!data) {
    return false;
  }
  //权限
  if (data === '没有权限') {
    window.location.replace('error.html');
  }
  if (data === '没有登陆') {
    window.location.replace('admin/login');
  }
  //string
  return data;

};


export function treeDataFormat(level, selfKey, parentKey, newKey, data) {
  if (!data) {
    return;
  }
  data = jsonParse(data);
  console.log(data);
  var temp = {},
      final = [];

  var treeRecursion = function (key, data) {
    if (!data) {
      return;
    }
    console.log(key)
    console.log(data);
    for (var i = 0; i < data.length; i++) {
      //console.log(key);
      //console.log(data[i][selfKey]);
      if (String(key) === String(data[i][selfKey])) {
        if (!data[i][newKey]) {
          data[i][newKey] = [];
        }
        data[i][newKey] = temp[key];
        return;
      } else {
        if (data[i][newKey]) {
          treeRecursion(key, data[i][newKey]);
        }
      }
    }
  };

  //找到父级 parentID =NULL / 0
  for (var i = 0; i < data.length; i++) {
    // console.log(data[i]);
    if (!data[i][parentKey]) {
      final.push(data[i]);
    } else {
      if (!temp[data[i][parentKey]]) {
        temp[data[i][parentKey]] = [];
      }
      temp[data[i][parentKey]].push(data[i]);
    }
  }
  //console.log('treeRecursion');

  //console.log(final);
  //console.log(temp);

  for (var j = 0; j < level - 1; j++) {
    for (var key in temp) {
      console.log(temp)
      treeRecursion(key, final);


    }
  }
  //console.warn(final);
  return final;
};
//转化为树形结构

export function transformTreeData(ary, data, idKey, parentKey, textKey, newKey) {
    var data = data ? data : (function (ary) {
        var tempAry = [];
        var idList = [];
        ary.forEach(function (item) {
            idList.push(item[idKey])
        });
        function deb(id, idList) {
            var flag = true;
            for (var ida in idList) {
                if (id == idList[ida]) {
                    flag = false;
                }
            }
            return flag;
        }
        for (var i = 0, len = ary.length; i < len; i++) {
            if (ary[i][parentKey] == undefined || (ary[i][parentKey] != undefined && deb(ary[i][parentKey], idList))) {
                var obj = {
                    text: ary[i][textKey], id: ary[i][idKey]
                };
                tempAry.push(obj);
            }
        }
        return tempAry;
    }(ary));
    var temp = 0;
    if (data.constructor == Array) {
        for (var i = 0, len = data.length; i < len; i++) {
            for (var j = 0, lenA = ary.length; j < lenA; j++) {
                if (ary[j][parentKey] == data[i].id) {
                    var obj = {
                        text: ary[j][textKey], id: ary[j][idKey]
                    };
                    data[i][newKey] = data[i][newKey] || [];
                    data[i][newKey].push(obj); temp++;
                }
            }
        }
    }
    if (temp > 0) {
        if (data.constructor == Array) {
            for (var n = 0, lenB = data.length; n < lenB; n++) {
                data[n].items = transformTreeData(ary, data[n][newKey] ? data[n][newKey] : []);
                if (data[n].items.length == 0) {
                    delete data[n][newKey];
                }
                //delete data[n].ID;
            }
        }
    } else {
        for (var n = 0, lenB = data.length; n < lenB; n++) {
            //delete data[n].ID;
        }
    }
    return data;
}

//规整数据
function getChildren (data,parentKey,idKey) {
  return function (item) {
    const arr = []
    data.forEach((value) => {
      if (value[parentKey] == item[idKey]) {
        arr.push(value);
      }
    });
    return arr;
  }
}
//规整数据
export  function regularCateData (data,parentKey,idKey){
  const arr = [];
  data.map((item) => {
    const list = getChildren(data,parentKey,idKey)(item);

    if (list.length > 0) {
      item['child'] = list;
    }
    console.log(item);
    if (!item[parentKey]) {
      arr.push(item);
    }
  });
  return arr;
}


export function getRandomNum(Min,Max)
{
  let Range = Max - Min;
  let Rand = Math.random();
  return(Min + Math.round(Rand * Range));
}   