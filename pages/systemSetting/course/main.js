import { KendoGrid } from '../../../component/kendo/grid';
import * as courseController from '../../../controller/systemSetting/course';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { actions } from "./actions";
import './addWindow';
import './editWindow';

let eventBus = memoryStore.get('globalEvent');
let courseGrid = null;
let gridDataSource = null;

function gridInit() {
    gridDataSource = courseController.getCourseList().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if (courseGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    courseGrid = new KendoGrid('#grid', {
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
            title: '科目名称',
        },
        {
            field: 'referencesList',
            title: '参考书目'
        },
        //{
        //    field: 'examinationContent',
        //    title: '考试大纲'
        //},
        {
            field: 'remarks',
            title: '备注'
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
        }

    });
    courseGrid.init()
}
$(function () {
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        memoryStore.set('selectedCollegeId', value);
        gridInit()
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        memoryStore.set('selectedCollegeId', value);
        gridInit()
        
    })
    eventBus.on(actions.refresh, function () {
        gridDataSource.read();
    });

    let deleteConfirmWindow = new ConfirmWindow('#deleteWindow', {
        type: 'delete',
        onSubmit: courseController.deleteCourse,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let enableConfirmWindow = new ConfirmWindow('#enableWindow', {
        type: 'enable',
        onSubmit: courseController.editCourse,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let disableConfirmWindow = new ConfirmWindow('#disableWindow', {
        type: 'disable',
        onSubmit: courseController.editCourse,
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