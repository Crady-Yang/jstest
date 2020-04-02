import * as resourceController from '../../../controller/rbac/resource';
import { KendoGrid } from '../../../component/kendo/grid'
import { actions } from "./actions";
import { ConfirmWindow } from "../../../component/confirmWindow";
import { BooleanTemplate } from '../../../component/booleanTemplate';


import './addWindow'
import './editWindow'
import {ResourceTypeObjectInstance} from "../../../objectValue/rbac/resourceType";


let dataSource = resourceController.getResourceGridDataSource().dataSource;
let eventBus = memoryStore.get('globalEvent');
let resourceGrid = null;


memoryStore.set('selectedId',null);
memoryStore.set('selectedData',null);

$(function () {

    if (!resourceGrid) {
        resourceGrid = new KendoGrid('#grid', {
            columns: [
                {
                    field: 'id',
                    title: '操作',
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
                    filterable: false,
                    width: 150
                },
                {
                    field: 'url',
                    title: '链接',
                },
                {
                    field: 'resourceType',
                    title: '资源类型',
                    width: 150,
                    template: function (data) {
                        return ResourceTypeObjectInstance.getByValue(data.resourceType, 'id').value
                    },
                    filterable: {
                        ui: function (element) {
                            element.kendoDropDownList({
                                dataSource: ResourceTypeObjectInstance.toObjectArray(),
                                dataTextField: "value",
                                dataValueField: "id"
                            })
                        },
                        operators: {
                            string: {
                                eq: '等于'
                            }
                        }
                    }
                },
                {
                    field: 'enabled',
                    title: '启用',
                    template: function (dataItem) {
                        return BooleanTemplate(dataItem.enabled)
                    },
                    filterable: {
                        messages: {
                            isTrue: "启用",
                            isFalse: "禁用"
                        }
                    }
                },
            ],
            dataSource: dataSource,
            dataBound: function (e) {
                $('#grid').find('.actionMenu').kendoMenu({
                    select: function (e) {
                        let id = e.item.getAttribute('data-id');
                        let data = dataSource.get(id);
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
                    let data = dataSource.get(id);
                    let action = this.getAttribute('data-action');
                    memoryStore.set('selectedId', id);
                    memoryStore.set('selectedData', data);
                    if (action) {
                        eventBus.trigger(action);
                    }
                })
            }
        });
        resourceGrid.init();
    }

	let deleteConfirmWindow = new ConfirmWindow('#deleteWindow',{
		type:'delete',
		onSubmit:resourceController.deleteResource,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});

	let enableConfirmWindow = new ConfirmWindow('#enableWindow',{
		type:'enable',
        onSubmit: resourceController.enableResource,
		onSuccess:function () {
			eventBus.trigger(actions.refresh)
		}
	});

	let disableConfirmWindow = new ConfirmWindow('#disableWindow',{
		type:'disable',
        onSubmit: resourceController.enableResource,
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

});
