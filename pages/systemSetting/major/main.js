import { KendoGrid } from '../../../component/kendo/grid';
import * as majorController from '../../../controller/systemSetting/major';
import { getSchoolSelectList } from '../../../controller/rbac/school';
import { getCollegeSelectList } from '../../../controller/rbac/college';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { SubGrid } from "../../../component/subGrid";
import { actions } from "./actions";
import { MajorTypeObjectInstance } from '../../../objectValue/systemSetting/majorType';
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType';
import './addWindow';
import './editWindow';
import './bindCourseWindow';

let eventBus = memoryStore.get('globalEvent');
let majorGrid = null;
let gridDataSource = null;

function gridInit() {
    let schoolFilter = null;
    let collegeFilter = null;
    gridDataSource = majorController.getMajorList().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if (majorGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    majorGrid = new KendoGrid('#grid', {
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
                    <li data-id="${dataItem.id}" data-action="${actions.openBindCourse}">绑定科目</li>
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
            title: '专业名称',
            width:120
        },
        {
            field: 'schoolId',
            title: '所属学校',
            width:150,
            filterable: {
                ui: function (element) {
                    let dataSource = getSchoolSelectList().dataSource;
                    schoolFilter = element.kendoDropDownList({
                        dataSource: dataSource,
                        optionLabel: "--Select Value--",
                        dataTextField: "name",
                        dataValueField: "id",
                        change: function () {

                        }
                    }).data("kendoDropDownList");
                },
                operators: {
                    string: {
                        eq: '等于'
                    }
                },
            },
            template: function (dataItem) {
                if (dataItem.schoolName) {
                    return `${dataItem.schoolName}`
                } else {
                    return '暂无数据'
                }
            }
        },
        {
            field: 'collegeId',
            title: '所属学院',
            width: 150,
            filterable: {
                ui: function (element) {
                    console.log(element)
                    let dataSource = getCollegeSelectList().mergeQuery(function () {
                        return {
                            schoolId: schoolFilter ? schoolFilter.value() : memoryStore.get('selectedSchoolId')
                        }
                    }).dataSource;
                    collegeFilter = element.kendoDropDownList({
                        dataSource: dataSource,
                        optionLabel: "--Select Value--",
                        dataTextField: "name",
                        dataValueField: "id",
                    }).data("kendoDropDownList");
                },
                operators: {
                    string: {
                        eq: '等于'
                    }
                },
            },
            template: function (dataItem) {
                if (dataItem.collegeName) {
                    return `${dataItem.collegeName}`
                } else {
                    return '暂无数据'
                }
            }
        },
        {
            field: 'majorType',
            title: '专业类型',
            width:120,
            filterable: {
                ui: function (element) {
                    let dataSource = MajorTypeObjectInstance.toObjectArray();
                    element.kendoDropDownList({
                        dataSource: dataSource,
                        optionLabel: "--请选择--",
                        dataTextField: "value",
                        dataValueField: "id",
                    });
                },
                operators: {
                    number: {
                        eq: '等于'
                    },
                    string: {
                        eq: '等于'
                    }
                },
            },
            template: function (dataItem) {
                return MajorTypeObjectInstance.getByValue(dataItem.majorType, "id")["value"]
            }
        },
        {
            field: 'studyType',
            title: '学习类型',
            width:120,
            filterable: {
                ui: function (element) {
                    let dataSource = StudyTypeObjectInstance.toObjectArray();
                    element.kendoDropDownList({
                        dataSource: dataSource,
                        optionLabel: "--请选择--",
                        dataTextField: "value",
                        dataValueField: "id",
                    });
                },
                operators: {
                    number: {
                        eq: '等于'
                    },
                    string: {
                        eq: '等于'
                    }
                },
            },
            template: function (dataItem) {
                if (dataItem.studyType!==null) {
                    return StudyTypeObjectInstance.getByValue(dataItem.studyType, "id")["value"]
                } else {
                    return ""
                }
               
            }
        },
        {
            field: 'code',
            title: '专业代码',
            width:120

        },
        {
            field: 'ifShowScore',
            title: '展示成绩',
            width:120,
            template: function (dataItem) {
                return BooleanTemplate(dataItem.ifShowScore)
            },
            filterable: {
                messages: {
                    isTrue: "向学生展示成绩",
                    isFalse: "不向学生展示成绩"
                }
            }
        },
            {
                field: 'ifAcceptDispensing',
                title: '是否接受调剂',
                width:180,
                template: function (dataItem) {
                    return BooleanTemplate(dataItem.ifAcceptDispensing)
                },
                filterable: {
                    messages: {
                        isTrue: "接受调剂",
                        isFalse: "不接受调剂"
                    }
                }
            },
        {
            field: 'enabled',
            title: '启用',
            width:120,
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
        },
        detailTemplate: kendo.template($("#subGridTemplate").html()),
        detailExpand: function (e) {
            //表格展开
            let detailRow = e.detailRow,
                uid = $(e.masterRow).attr('data-uid'),
                masterRowData = gridDataSource.getByUid(uid),
                gridEl = detailRow.find('div.subGrid'),
                subDatasource = majorController.getExaminationCoursesByMajor().mergeQuery(function () {
                    return {
                        majorId: masterRowData.id
                    }
                })
            console.log('--------masterRowData-----------');
            console.log(subDatasource)
            console.log(masterRowData)
            let subGrid = new SubGrid({
                rowData: masterRowData,
                gridEl: gridEl,
                dataSource: subDatasource,
                columns: [
                    {
                        field: "name", title: "科目名称", width: '120px'

                    },
                    {
                        field: "referencesList", title: "参考书目", width: '180px'
                    },
                    //{
                    //    field: "examinationContent", title: "考试大纲", width: '180px',
                    //},
                    {
                        field: "remarks", title: "备注", width: '150px',
                    },
                ]
            });
            subGrid.init();
        }

    });
    majorGrid.init()
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
        onSubmit: majorController.deleteMajor,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let enableConfirmWindow = new ConfirmWindow('#enableWindow', {
        type: 'enable',
        onSubmit: majorController.enableMajor,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let disableConfirmWindow = new ConfirmWindow('#disableWindow', {
        type: 'disable',
        onSubmit: majorController.enableMajor,
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