import * as roleController from '../../../controller/rbac/role'
import { GlobalEventName } from '../../../common/globalEventName';
import { KendoGrid } from '../../../component/kendo/grid'
import { actions } from "./actions"
import { ConfirmWindow } from "../../../component/confirmWindow"
import { getResourceDropDownList } from '../../../controller/rbac/resource'
import { BooleanTemplate } from '../../../component/booleanTemplate'


import './addWindow'
import './editWindow'
import './authWindow'

//let schoolDataSource = getschoolDropDownList().dataSource;
let schoolSelector = null;
let eventBus = memoryStore.get('globalEvent');
let roleGrid = null;
let schoolDataSource=null

memoryStore.set('selectedId',null);
memoryStore.set('selectedData',null);
memoryStore.set('selectedschoolId',null);
memoryStore.set('selectedResourceId',null);

$(function () {
    eventBus.on(GlobalEventName.SelectSchool, function (value) {
        memoryStore.set('selectedSchoolId', value);
        schoolDataSource = roleController.getRoleGridDataSource().mergeQuery(function () {
            return {
                schoolId: memoryStore.get('selectedSchoolId')
            }
        }).dataSource;
        if (!roleGrid) {
            roleGrid = new KendoGrid('#grid', {
                columns: [
                    {
                        field: 'id',
                        title: 'Actions',
                        filterable: false,
                        width: 150,
                        template: function (dataItem) {
                            if (dataItem.enabled) {
                                return `
              <ul class="actionMenu hidden" style="display: inline-block">
                <li>
                  操作
                  <ul>
                    <li data-id="${dataItem.id}" data-action="${actions.openEdit}">编辑</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openDelete}">删除</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openDisable}">禁用</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openAuth}">配置权限</li>
                  </ul>
                </li>	
              </ul>
            `
                            } else {
                                return `<button data-action="${actions.openEnable}" data-id="${dataItem.id}" class="enableBtn k-button k-icon-button">启用</button>`
                            }
                        }
                    },
                    {
                        field: 'name',
                        title: '名称',
                    },
                    // {
                    // 	field:'creationTime',
                    // 	title:'CreationTime',
                    // 	filterable:false
                    // },
                    //{
                    //    field: 'isSystem',
                    //    title: 'isSystem',
                    //    filterable: false,
                    //    width: 100,
                    //    template: function (dataItem) {
                    //        return BooleanTemplate(dataItem.isSystem)
                    //    }
                    //},
                    {
                        field: 'enabled',
                        title: '启用状态',
                        template: function (dataItem) {
                            return BooleanTemplate(dataItem.enabled)
                        },
                        filterable: {
                            messages: {
                                isTrue: "是",
                                isFalse: "否"
                            }
                        }
                    },
                ],
                dataSource: schoolDataSource,
                dataBound: function (e) {
                    $('#grid').find('.actionMenu').kendoMenu({
                        select: function (e) {
                            let id = e.item.getAttribute('data-id');
                            let data = schoolDataSource.get(id);
                            let action = e.item.getAttribute('data-action');
                            memoryStore.set('selectedId', id);
                            memoryStore.set('selectedData', data);
                            if (action) {
                                eventBus.trigger(action);
                            }
                            e.preventDefault()
                        }
                    }).removeClass('hidden');
                    //bind button
                    $('#grid').find('.enableBtn').on('click', function () {
                        let id = this.getAttribute('data-id');
                        let data = schoolDataSource.get(id);
                        let action = this.getAttribute('data-action');
                        memoryStore.set('selectedId', id);
                        memoryStore.set('selectedData', data);
                        if (action) {
                            eventBus.trigger(action);
                        }
                    })
                }
            });
            roleGrid.init();
        }
    })

    eventBus.on(GlobalEventName.SchoolChange, function () {
        schoolDataSource.read();
    })
    eventBus.on(actions.refresh, function () {
        schoolDataSource.read();
    });
	let deleteConfirmWindow = new ConfirmWindow('#deleteWindow',{
		type:'delete',
		onSubmit:roleController.deleteRole,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});

	let enableConfirmWindow = new ConfirmWindow('#enableWindow',{
		type:'enable',
        onSubmit: roleController.editRole,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});

	let disableConfirmWindow = new ConfirmWindow('#disableWindow',{
		type:'disable',
        onSubmit: roleController.editRole,
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

	

});
