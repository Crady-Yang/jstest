
function stringFilter(value) {
  return value
}

function formatTime (date) {
  let d = new Date(date);
  let tf = function (i) { return (i < 10 ? '0' : '') + i };
  date = tf(d.getFullYear()) + '-' + tf((d.getMonth() + 1)) + '-' + tf(d.getDate()) + " " + tf(d.getHours()) + ":" + tf(d.getMinutes()) + ":" + tf(d.getSeconds());
  return date;
}

//递归过滤对象,数组中的字符串
function objFilter (data) {

  if (!data) {
    return data;
  }

  if (typeof data === 'string') {
    return stringFilter(data);
  }

  if (typeof data === 'object') {
    for(let k in data){
      let value = data[k]
      if (typeof value === 'string') {
        data[k] = stringFilter(value);
      } else {
        objFilter(value);
      }
    }
  }
  return data;
}

// 设定需要多选的键值，关联对应的objectValue
function parseMultiFilterValue(filterData){
  let final = {};
  let map = {
    approveStatus:ApproveStatusObjectInstance,
    acceptStatus:AcceptStatusObjectInstance
  };
  for(let i=0;i<filterData.length;i++){
    let key = filterData[i].field;
    let value = filterData[i].value;
    if(map[key]){
      value = value.split(',');
      for(let k=0;k<value.length;k++){
        let t_value = value[k];
        let temp =  map[key].getByValue(t_value,'value');
        if(temp){
          if(!final[key]){
            final[key] = []
          }
          final[key].push(temp.id)
        }
      }
      final[key] = JSON.stringify(final[key])
    }
  }
  return final

}

//filter数据
let formatFilterData = function (data) {
  data = data['filters'];
 // data = objFilter(data)
  let final = {};
  let date = [];
  console.log('----------------------filterdata------------------------')
  console.log(data);
  let approveStatus=[];
  let acceptStatus=[];
  //let multiFilter = parseMultiFilterValue(data);
  for (let i = 0; i < data.length; i++) {
    if (data[i]["operator"] === "gt") {
      data[i]["field"] = data[i]["field"] + "Start";

      //data[i]["value"] = moment(data[i]["value"]).subtract(8,'h').format('YYYY-MM-DD HH:mm:ss')
        data[i]["value"] = moment(data[i]["value"]).format('YYYY-MM-DD HH:mm:ss')

      date.push(data[i]);
    } else if (data[i]["operator"] === "lt") {
      data[i]["field"] = data[i]["field"] + "End";
      data[i]["value"] = moment(data[i]["value"]).format('YYYY-MM-DD HH:mm:ss')
      date.push(data[i]);
    }else if (data[i]['filters']) {
      for (let j = 0; j < data[i]['filters'].length; j++) {
        let timeArray = data[i]['filters'][j];
        if (timeArray["operator"] === "gt") {
          timeArray["field"] = timeArray["field"] + "Start";

          timeArray["value"] = moment(data[i]["value"]).format('YYYY-MM-DD HH:mm:ss')
          date.push(timeArray);
        } else if (timeArray["operator"] === "lt") {
          timeArray["field"] = timeArray["field"] + "End";

          timeArray["value"] = moment(data[i]["value"]).format('YYYY-MM-DD HH:mm:ss')
          date.push(timeArray);
        }
      }
    } else{
      if(data[i]['operator']!=='neq'){
        date.push(data[i])
      }
    }
  }
  for (let k = 0; k < date.length; k++) {
    final[date[k]["field"]] = date[k]['value'];
  }
  //for(let k in multiFilter){
  //  final[k] = multiFilter[k]
  //}
  return final;
}


//规整搜索数据
function formatKendoGridParamData (data, needQuery) {
  let filterData = {}
  let filterDataJson
  if(!data['filter']){
    return data
  }
  console.log(data);
  filterData = formatFilterData(data['filter']);
  // if (needQuery) {
  //   filterDataJson = filterData;
  // } else {
  //   if (data['query']) {
  //     let dataquery = JSON.parse(data['query']);
  //     dataquery = $.extend({}, dataquery, filterData);
  //     dataquery = JSON.stringify(dataquery);
  //     filterDataJson = { 'query': dataquery };
  //   } else {
  //     filterData = JSON.stringify(filterData);
  //     filterDataJson = { 'query': filterData };
  //   }
  // }
  //
  // console.log('-------------- formatKendoGridParamData ---------------')
  // console.log(filterData);
  //data = Object.assign({},data,filterDataJson)
  data = Object.assign({},data,filterData)
  delete data['filter'] //重置原来的筛选对象
  return data

}

export {
  formatKendoGridParamData
}



