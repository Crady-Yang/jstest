import * as menuController from '../../../controller/rbac/menu'
import { KendoGrid } from '../../../component/kendo/grid'
import { LoadingContainer } from '../../../component/loadingContainer'
import { actions } from "./actions";
import { ConfirmWindow } from "../../../component/confirmWindow";
import { BooleanTemplate } from '../../../component/booleanTemplate'


import './addWindow'
import './editWindow'
import {editMenu} from "../../../controller/rbac/menu";

let dataSource = menuController.getMenuListDataSource().mergeQuery(function () {
    return {
        page: 1,
        pageSize:10000
    }
}).dataSource;
let eventBus = memoryStore.get('globalEvent');


memoryStore.set('selectedId',null);
memoryStore.set('selectedData',null);

$(function () {

  let grid = $("#grid").kendoTreeList({
      filterable: {
          extra: false,
          operators: {
              string: {
                  eq: "包含"
              },
              number: {
                  eq: "大于等于"
              },
              select: {
                  eq: "等于"
              }
          },
          //做多语言时配置
          messages: {
              info: "筛选条件：",
              and: "且",
              or: "或",
              filter: "筛选",
              clear: "清除筛选"
          }
      },
	  dataSource:dataSource,
	  pageable:false,
	  editable: {
		  move: true
	  },
	  dragend: function(e) {
		  console.log("drag ended", e.source, e.destination);
		  let id = e.source.id;
		  editMenu(e.source).then((data)=>{
			  dataSource.read()
		  }).catch((e)=>{

		  })
	  },
	  columns: [
		  {
			  title: "操作",
			  field: "id",
			  filterable:false,
			  width:150,
			  template:function (dataItem) {
				  if(dataItem.enabled){
					  return `
              <ul class="actionMenu hidden" style="display: inline-block">
                <li>
                  操作
                  <ul>
                    <li data-id="${dataItem.id}" data-action="${actions.openEdit}">编辑</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openDelete}">删除</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openDisable}">禁用</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openAddSub}">添加子菜单</li>
                  </ul>
                </li>	
              </ul>
            `
				  }else {
					  return `<button data-action="${actions.openEnable}" data-id="${dataItem.id}" class="enableBtn k-button k-icon-button">enable</button>`
				  }

			  },
		  },
		  {
			  title: "菜单名",
			  field: "name",
			  width:200,
			  template(data){
			  	let labelDom = '';
			  	if(!data.parentId || data.parentId === '00000000-0000-0000-0000-000000000000'){
					  labelDom = '<span class="lw-label">root</span>'
				  }
			  	return `${labelDom}<span>${data.name}</span>`
			  },
		  },
		  {
			  title:'标题',
			  field:'title',
			  width:200,
			  template:function (dateItem) {
			  	let iconDom = dateItem.icon ? `${dateItem.icon}`:'';
			  	return `<span style="width: 20px;display: inline-block">${iconDom}</span><span class="display: inline-block">${dateItem.name}</span>`
			  },
		  },
		  {
			  title:'链接',
			  field:'url'
		  },
		  {
			  title:'是否显示',
              field:'isDisplay',
			  filterable:false,
			  template(data){
                  return BooleanTemplate(data.isDisplay)
			  }
          },
          {
              title: '启用',
              field: 'enabled',
              filterable: false,
              template(data) {
                  return BooleanTemplate(data.enabled)
              },
              filterable: {
                  messages: {
                      isTrue: "是",
                      isFalse: "否"
                  }
              }
          },
		  {
			  title:'排序',
              field:'displayOrder',
			  filterable:false,
			  width:100
		  }
	  ],
	  dataBound:function(){
		  $('#grid').find('.actionMenu').kendoMenu({
			  select:function (e) {
				  let id = e.item.getAttribute('data-id');
				  let data = dataSource.get(id);
				  let action = e.item.getAttribute('data-action');
				  memoryStore.set('selectedId',id);
				  memoryStore.set('selectedData',data);
				  if(action){
					  eventBus.trigger(action);
				  }
				  e.preventDefault()
			  }
		  }).removeClass('hidden');
		  $('#grid').find('.enableBtn').on('click',function () {
			  let id = this.getAttribute('data-id');
			  let data = dataSource.get(id);
			  let action = this.getAttribute('data-action');
			  memoryStore.set('selectedId',id);
			  memoryStore.set('selectedData',data);
			  if(action){
				  eventBus.trigger(action);
			  }
		  })
	  },
  });


	let deleteConfirmWindow = new ConfirmWindow('#deleteWindow',{
		type:'delete',
		onSubmit:menuController.deleteMenu,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});

	let enableConfirmWindow = new ConfirmWindow('#enableWindow',{
		type:'enable',
		onSubmit:menuController.enableMenu,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});

	let disableConfirmWindow = new ConfirmWindow('#disableWindow',{
		type:'disable',
		onSubmit:menuController.enableMenu,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});


	eventBus.on(actions.openDelete,function () {
		deleteConfirmWindow.open(memoryStore.get('selectedData'))
	});

	eventBus.on(actions.openEnable,function () {
		enableConfirmWindow.open(memoryStore.get('selectedData'))
	});

	eventBus.on(actions.openDisable,function () {
		disableConfirmWindow.open(memoryStore.get('selectedData'))
	});

	eventBus.on(actions.refresh,function () {
		dataSource.read();
	});

	eventBus.on(actions.openAddSub,function () {

	})

});
