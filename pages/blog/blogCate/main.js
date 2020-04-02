import { KendoGrid } from '../../../component/kendo/grid';
import * as blogCateController from '../../../controller/blog/blogCate';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { actions } from "./actions";
import './addWindow';
import './editWindow';

let eventBus = memoryStore.get('globalEvent');
let blogCateGrid = null;
let gridDataSource = null;


$(function () {
    gridDataSource = blogCateController.getListBlogCategoryInfo().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if (blogCateGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    blogCateGrid = new KendoGrid('#grid', {
        columns: [{
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
            title: '分类名称',
        },
        {
            field: 'slug',
            title: 'slug',
        },
        {
            field: 'isDisplay',
            title: '是否显示',
            template: function (dataItem) {
                return BooleanTemplate(dataItem.isDisplay)
            },
            filterable: {
                messages: {
                    isTrue: "显示",
                    isFalse: "不显示"
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
        {
            field: 'creationTime',
            title: '创建时间',
            format: "{0: yyyy-MM-dd HH:mm:ss}",
            //template: function (dataItem) {
            //    return moment(dataItem.creationTime).format('YYYY-MM-DD HH:mm:ss')
            //}
        },
        ],
        dataSource: gridDataSource,
        dataBound: function (e) {
            $('#grid').find('.actionMenu').kendoMenu({
                select: function (e) {
                    let id = e.item.getAttribute('data-id');
                    let data = gridDataSource.get(id);
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
                let data = gridDataSource.get(id);
                let action = this.getAttribute('data-action');
                memoryStore.set('selectedId', id);
                memoryStore.set('selectedData', data);
                if (action) {
                    eventBus.trigger(action);
                }
            })
        },

    });
    blogCateGrid.init()
    eventBus.on(actions.refresh, function () {
        console.log(gridDataSource)
        gridDataSource.read();
    });

    let deleteConfirmWindow = new ConfirmWindow('#deleteWindow', {
        type: 'delete',
        onSubmit: blogCateController.deleteBlogCategory,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let enableConfirmWindow = new ConfirmWindow('#enableWindow', {
        type: 'enable',
        onSubmit: blogCateController.editBlogCategory,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let disableConfirmWindow = new ConfirmWindow('#disableWindow', {
        type: 'disable',
        onSubmit: blogCateController.editBlogCategory,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });


    eventBus.on(actions.openDelete, function () {
        deleteConfirmWindow.open(memoryStore.get('selectedData'))
    });

    eventBus.on(actions.openEnable, function () {
        enableConfirmWindow.open(memoryStore.get('selectedData'))
    });

    eventBus.on(actions.openDisable, function () {
        disableConfirmWindow.open(memoryStore.get('selectedData'))
    });
})