import { KendoGrid } from '../../../component/kendo/grid';
import * as scheduleController from '../../../controller/retestManagement/examinationSchedule';
import { exportSchedule } from '../../../controller/retestManagement/examinationSchedule';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { SubGrid } from "../../../component/subGrid";
import { fileDownLoader } from '../../../component/downloadFile'
import { TestTypeObjectInstance } from '../../../objectValue/retestManagement/testType';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection';
import { Form } from "../../../component/form";
import { SendMsgWindow } from '../../../component/sendMsgWindow';
//import './sendMsg';
import './moveToOther';

let eventBus = memoryStore.get('globalEvent');
let grid = null;
let gridDataSource = null;
let testTypeDataSource = TestTypeObjectInstance.toObjectArray()
let searchDto = ApiCollection['post/admin/Schedule/ScheduleList'].reqDto;
let sendMsgWindow = null;
let searchForm = new Form('.searchPart', {
    dto: searchDto,
    onSubmit: function () {
        gridDataSource.read().then(()=>{
            
        })
    }
});
function btnEnable(selectItem) {
    console.log(selectItem)
    //let selected = grid.getSelected();
    let selected =selectItem
    let isStart = false;
    let isSameType = true;
    if (selected.length > 0) {
        let type = selected[0]["scheduleType"];
        for (let i = 0; i < selected.length; i++) {
            //已经开始的复试安排不能移动
            if (selected[i]["isStart"]) {
                isStart = true
                break
            }
            //不同的复试安排类型不能一起移动
            if (selected[i]["scheduleType"] !== type) {
                isSameType = false
                break
            }
        }
        if (!isStart && isSameType) {
            $("#moveToBtn").removeAttr("disabled")
        } else {
            $("#moveToBtn").attr("disabled", "disabled")
        }
        $("#sendBtn").removeAttr("disabled")
    } else {
        $("#moveToBtn").attr("disabled", "disabled")
        $("#sendBtn").attr("disabled", "disabled")
    }
}
function gridInit() {
    gridDataSource = scheduleController.getScheduleList().mergeQuery(function () {
        // let searchValue = searchForm.getExistValue();
        let defaultParam = {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId'),
        };
        return defaultParam;
    }).dataSource;
    if (grid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    // grid = new KendoGrid('#grid', {
    //     columns: [
    //         {
    //             selectable: true,
    //             width: '80px'
    //         },
    //         {
    //         title: '',
    //         field: 'scheduleId',
    //         hidden: true,
    //         width: "400px",
    //         filterable: false,
    //         groupHeaderTemplate: function (data) {
    //             data = data.items[0];
    //             let type = TestTypeObjectInstance.getByValue(data.scheduleType, 'id');
    //             let orderStatusDom = type ? `<span class="lw-label" style="background-color: ${type.color};">${type.value}</span>` : `<span class="lw-label">未知类型</span>`
    //             return `<div class="clearfix groupHeader">
    //                         <span class="pull-left groupHeaderItem">分组名：${data.scheduleName}</span>
    //                         <span class="pull-left groupHeaderItem">${orderStatusDom}</span>
    //                         <span class="pull-left groupHeaderItem">时间：${moment(data.startTime).format('YYYY-MM-DD HH:mm:ss')}--${moment(data.endTime).format('YYYY-MM-DD HH:mm:ss')}</span>
    //                         <span class="pull-left groupHeaderItem">人数：${data.groupCount}</span>
    //                         <span class="pull-left groupHeaderItem">地点：${data.scheduleAddress}</span>
    //                         <span class="pull-right"> <button class="k-button k-icon-button editBtn actionBtn" data-id=${data.scheduleId} data-action="${actions.openEdit}">编辑</button>
    //                         <button class="k-button k-icon-button deleteBtn actionBtn" data-id=${data.id} data-action="${actions.openDelete}">删除</button>
    //                         <button class="k-button k-icon-button reviewIconBtn actionBtn" data-id=${data.scheduleId} data-action="${actions.openEdit}">详情</button><span>
    //
    //                     </div>`
    //         }
    //          },
    //         {
    //             field: 'userName',
    //             title: '学生姓名',
    //             template: function (dataItem) {
    //                 return `<a href="/admin/candidateDetail?id=${dataItem.userId}&applyid=${dataItem.applicationId}&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--sub-h);">${dataItem.userName}</a>`
    //             }
    //         },
    //         {
    //             field: 'order',
    //             title: '排序'
    //         },
    //         {
    //             field: 'isNotify',
    //             title: '是否已通知',
    //             template: function (dataItem) {
    //                 return BooleanTemplate(dataItem.isNotify)
    //             },
    //             filterable: {
    //                 messages: {
    //                     isTrue: "是",
    //                     isFalse: "否"
    //                 }
    //             }
    //         },
    //         {
    //             field: 'isStart',
    //             title: '是否已开始',
    //             template: function (dataItem) {
    //                 return BooleanTemplate(dataItem.isStart)
    //             },
    //             filterable: {
    //                 messages: {
    //                     isTrue: "是",
    //                     isFalse: "否"
    //                 }
    //             }
    //         },
    //         {
    //             field: 'mobile',
    //             title: '手机号码',
    //         },
    //     ],
    //     dataSource: gridDataSource,
    //     filterable:false,
    //     change: function () {
    //         let selected = grid.getSelected();
    //         memoryStore.set('selectedData', selected);
    //         btnEnable()
    //     },
    //     dataBound: function (e) {
    //         if (searchForm) {
    //             searchForm.cancelLoading();
    //         }
    //         $('#grid').find('.actionBtn').off().on("click", function () {
    //             let id = $(this).attr('data-id');
    //             let data = gridDataSource.get(id);
    //             let action = $(this).attr('data-action');
    //             memoryStore.set('selectedId', id);
    //             memoryStore.set('selectedData', data);
    //             if (action) {
    //                 eventBus.trigger(action);
    //             }
    //             e.preventDefault()
    //         })
    //         btnEnable()
    //     },
    //
    // });
    grid = new KendoGrid('#grid', {
        columns: [ {
                field: 'id',
                title: '操作',
                filterable: false,
                width: 120,
                template: function (dataItem) {
                    return `
                        <ul class="actionMenu hidden" style="display: inline-block">
                        <li>
                            操作
                            <ul>
                            <li data-id="${dataItem.id}" data-action="${actions.openEdit}">编辑</li>
                            <li data-id="${dataItem.id}" data-action="${actions.openDelete}">删除</li>
                            </ul>
                        </li>
                        </ul>
                    `
                }
            },
            {
                field: 'scheduleName',
                title: '分组名',
                width:180
            },
            {
                field: 'scheduleType',
                title: '类型',
                width:150,
                template(v){
                    let t = TestTypeObjectInstance.getByValue(v.scheduleType,'id');
                    return t ? t.value : '未设置类型'
                },
                filterable: {
                    ui: function (element) {
                        let dataSource = TestTypeObjectInstance.toObjectArray();
                        element.kendoDropDownList({
                            dataSource:dataSource,
                            optionLabel: "--请选择--",
                            dataTextField: "value",
                            dataValueField: "id",
                        });
                    },
                    operators: {
                        string: {
                            eq: "等于"
                        }
                    },
                },
            },
            {
                field: 'startTime',
                title: '开始时间',
                format: "{0: yyyy-MM-dd HH:mm:ss}",
                width:200,
                filterable:false,
                // filterable: {
                //     ui: function (element) {
                //         element.kendoDateTimePicker({
                //             format: '{0: yyyy-MM-dd HH:mm:ss}',
                //         });
                //     },
                //     operators: {
                //         date: {
                //             gt: "开始时间"
                //         }
                //     },
                // },
            },
            {
                field: 'endTime',
                title: '结束时间',
                format: "{0: yyyy-MM-dd HH:mm:ss}",
                width:200,
                filterable:false
                // filterable: {
                //     ui: function (element) {
                //         element.kendoDateTimePicker({
                //             format: '{0: yyyy-MM-dd HH:mm:ss}',
                //         });
                //     },
                //     operators: {
                //         date: {
                //             gt: "结束时间"
                //         }
                //     },
                // }
            },
            {
                field: 'groupCount',
                title: '人数',
                width:120,
                filterable:false
            },
            {
                field: 'scheduleAddress',
                title: '考试地点',
                width:180,
                filterable:false
            },
        ],
        dataSource: gridDataSource,
        change: function () {
            let selected = grid.getSelected();
            sendBtnEnable(selected)
            memoryStore.set('selectedData', selected);
        },
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
        },
        detailTemplate: kendo.template($("#subGridTemplate").html()),
        detailExpand: function (e) {
            //表格展开
            let detailRow = e.detailRow,
                uid = $(e.masterRow).attr('data-uid'),
                masterRowData = gridDataSource.getByUid(uid),
                gridEl = detailRow.find('div.subGrid'),
                subDatasource = scheduleController.getCandidateByScheduleId().mergeQuery(function () {
                    return {
                        id: masterRowData.id
                    }
                })
            let subGrid = new SubGrid({
                rowData: masterRowData,
                gridEl: gridEl,
                dataSource: subDatasource,
                columns: [
                    {
                        selectable: true,
                        width: '30px'
                    },
                    {
                        field: "order", title: "排序", width: '180px',
                    },
                    {
                        field: "userName", title: "学生名", width: '120px',
                        template: function (dataItem) {
                            return `<a href="/admin/candidateDetail?id=${dataItem.userId}&applyid=null&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--main-h);text-decoration: underline!important;">${dataItem.userName}</a>`
                        }

                    },
                    
                    {
                        field: "isNotify", title: "是否已通知", width: '180px',
                        template: function (dataItem) {
                            return BooleanTemplate(dataItem.isNotify)
                        },
                    },
                    {
                        field: "mobile", title: "手机号码", width: '180px',
                    },

                ],
                pageable: false,
                change: function () {
                    let selectItem = [];
                    $("#grid").find(".subGrid").each(function (index, item) {
                        let selectedRows = $(item).data("kendoGrid").select()
                        let instance = $(item).data("kendoGrid")
                        for (let i = 0; i < selectedRows.length; i++) {
                            let dataItem = instance.dataItem(selectedRows[i]);
                            dataItem['isStart']=masterRowData['isStart'];
                            dataItem['scheduleType']=masterRowData['scheduleType']
                            selectItem.push(dataItem);
                        }
                    })
                    btnEnable(selectItem)
                    memoryStore.set('selectedData', selectItem);
                },
            });
            subGrid.init();
        }

    });
    grid.init()
}
//统计部分渲染
function staticPartRend() {
    let param = {
        "targetSchoolId": memoryStore.get('selectedSchoolId'),
        "targetCollegeId": memoryStore.get('selectedCollegeId')
    }
    scheduleController.getApplicationCount(param).then((data) => {
        $(".writtenNumber").text(data.waitWrittenExamination);
        $(".faceNumber").text(data.waitInterview);
        //$(".arrangementNumber").text(data.arranged);
    })
}
$(function () {
    $(".searchPart").find('[name="type"]').kendoDropDownList({
        dataTextField: "value",
        dataValueField: "id",
        dataSource: testTypeDataSource,
        optionLabel: "请选择类型"
    })
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        memoryStore.set('selectedCollegeId', value);
        staticPartRend()
        gridInit()
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        memoryStore.set('selectedCollegeId', value);
        staticPartRend()
        gridInit()
    })
    eventBus.on(actions.refresh, function () {
        gridDataSource.read();
    });

    let deleteConfirmWindow = new ConfirmWindow('#deleteWindow', {
        type: 'delete',
        nameField: 'scheduleName',
        idField:'scheduleId',
        onSubmit: scheduleController.deleteSchedule,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    eventBus.on(actions.openDelete, function () {
        console.log(memoryStore.get('selectedData'))
        deleteConfirmWindow.open(memoryStore.get('selectedData'))
    });
    eventBus.on(actions.openEdit, function () {
        let id = memoryStore.get('selectedId');
        window.location.href = `/admin/AddExaminationSchedule?id=${id}`
    });
    //导出复试安排
    let exportSchedule = new fileDownLoader("#exportBtn", {
        url: '/admin/Schedule/Export',
        method: 'get'
    });
    exportSchedule.init();
    $("#sendBtn").off().on("click", function () {
        if (!sendMsgWindow) {
            sendMsgWindow = new SendMsgWindow("#sendMsgWindow", {
                messageNode: MessageNodeObjectInstance.getByValue("examinationArrange", "key").id,
                sendCallback: function () {
                    eventBus.trigger(actions.refresh)
                }
            })
            sendMsgWindow.init()
        }
        sendMsgWindow.open()
    })
})