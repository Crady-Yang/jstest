import { KendoGrid } from '../../../component/kendo/grid';
import { getResultList } from '../../../controller/retestManagement/examinationResults';
import { getCourseInfoById } from '../../../controller/systemSetting/course';
import { getMajorDropdownList } from '../../../controller/systemSetting/major';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { actions } from './actions'
import { EnrollstatusObjectInstance } from '../../../objectValue/retestManagement/enrollstatus';
import { HealthCheckMethodObjectInstance } from '../../../objectValue/retestManagement/healthCheckMethod';
import { EnrollmentNotificationMethodObjectInstance } from '../../../objectValue/retestManagement/enrollmentNotificationMethod';
import { fileDownLoader } from '../../../component/downloadFile';
import { SendMsgWindow } from '../../../component/sendMsgWindow';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
import { ExaminationTypeObjectInstance } from '../../../objectValue/retestManagement/examinationType';
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType';
import "./addWindow";
import "./editWindow";
import "./importWindow";
let eventBus = memoryStore.get('globalEvent');
let gridInstance = null;
let sendMsgWindow = null;
let defineColumn = [
    {
        field: 'healthCheckMethod',
        title: '体检选择',
        width: 120,
        filterable: {
            ui: function (element) {
                let dataSource = HealthCheckMethodObjectInstance.toObjectArray();
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
            if (HealthCheckMethodObjectInstance.getByValue(dataItem.healthCheckMethod, "id")) {
                return HealthCheckMethodObjectInstance.getByValue(dataItem.healthCheckMethod, "id")["value"]
            } else {
                return ""
            }
        }
    },
    {
        field: 'healthCheckResult',
        title: '体检结果',
        width: 120,
    },
    {
        field: 'enrollmentNotificationMethod',
        title: '通知书领取方式',
        width: 140,
        filterable: {
            ui: function (element) {
                let dataSource = EnrollmentNotificationMethodObjectInstance.toObjectArray();
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
            if (EnrollmentNotificationMethodObjectInstance.getByValue(dataItem.enrollmentNotificationMethod, "id")) {
                return EnrollmentNotificationMethodObjectInstance.getByValue(dataItem.enrollmentNotificationMethod, "id")["value"]
            } else {
                return ""
            }
        }
    }
];

//默认显示拟录取名单
memoryStore.set('enrollStatus', EnrollstatusObjectInstance.getByValue("Admission", "key").id)

let gridDatasource = getResultList().mergeQuery(function () {
    return {
        enrollStatus: memoryStore.get('enrollStatus'),
        targetSchoolId: memoryStore.get('selectedSchoolId'),
        targetCollegeId: memoryStore.get('selectedCollegeId'),
        targetMajorId: memoryStore.get('selectedMajorId'),
        approveTimeStart: $('#applicateStartTimeSelector').val(),
        approveTimeEnd: $('#applicateEndTimeSelector').val()
    }
}).dataSource;
//表格渲染
function gridInit(el) {
    gridInstance = $(el).data('kendoGrid')
    let columns = [{
            selectable: true,
            width: 50
        },
        {
            field:'localIndex',
            title:'序号',
            width:80,
            template:function(e){
                let id=e.applicationId;
                return _.findIndex(e.parent(),function (o) {return o.applicationId===id})+1
            },
            filterable:false
        },
        {
            field: "id",
            title: "操作",
            filterable:false,
            width: 150,
            template: function (item) {
                let status = memoryStore.get('enrollStatus');
                if (status === EnrollstatusObjectInstance.getByValue("NoEntered", "key").id) {
                    return `<button class="k-button k-icon-button addBtn actionBtn" data-id=${item.id} data-applicationId=${item.applicationId} data-userId="${item.userId}" data-action="${actions.addResult}">添加复试结果</button>`
                } else {
                    return `<button class="k-button k-icon-button editBtn actionBtn" data-id=${item.id} data-action="${actions.editResult}">修改成绩</button>`
                }
                
            }
        },
        {
            field: 'userName',
            title: '考生姓名',
            width: 150,
            template: function (dataItem) {
                return `<a href="/admin/candidateDetail?id=${dataItem.userId}&applyid=${dataItem.applicationId}&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--main-h);text-decoration: underline!important;">${dataItem.userName}</a>`
            }
        },
        {
            field: 'candidateNumber',
            title: '考生编号',
            width: 200,
        },
        {
            field: 'majorName',
            title: '专业',
            width: 200,
        },
        {
            field: 'examinationType',
            title: '复试类型',
            width: 180,
            filterable: {
                ui: function (element) {
                    let dataSource = ExaminationTypeObjectInstance.toObjectArray();
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
                if (ExaminationTypeObjectInstance.getByValue(dataItem.examinationType, "id")) {
                    return ExaminationTypeObjectInstance.getByValue(dataItem.examinationType, "id")["value"]
                } else {
                    return ""
                }
            }
        },
        {
            field: 'studyType',
            title: '学习类型',
            width: 150,
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
                if (dataItem.studyType !== null) {
                    return StudyTypeObjectInstance.getByValue(dataItem.studyType, "id")["value"]
                } else {
                    return ''
                }
            }
        },
        //{
        //    field: 'courseName',
        //    title: '复试科目',
        //    width: 130,
        //    template: function (dataItem) {
        //        return `<span style="color:var(--sub-h);cursor: pointer;" class="courseName" data-id="${dataItem.examinationCourseId}">${dataItem.courseName}<span class="content"></span></span>`
        //    }
        //},
        {
            field: 'mobile',
            title: '手机号码',
            width: 180,
        },
        //{
        //    field: 'isFreshGraduate',
        //    title: '是否应届生',
        //    width: 150,
        //    template: function (dataItem) {
        //        return BooleanTemplate(dataItem.isFreshGraduate)
        //    },
        //    filterable: {
        //        messages: {
        //            isTrue: "是",
        //            isFalse: "否"
        //        }
        //    }
        //},
        {
            field: 'isNotify',
            title: '是否已通知',
            width: 150,
            template: function (dataItem) {
                return BooleanTemplate(dataItem.isNotify)
            },
            filterable: {
                messages: {
                    isTrue: "是",
                    isFalse: "否"
                }
            }
        },
        {
            field: 'writtenScore',
            title: '笔试成绩',
            width: 120,
        },
        {
            field: 'interviewScore',
            title: '面试成绩',
            width: 120,
        },
        {
            field: 'examinationScore',
            title: '复试总分',
            width: 120,
        },
        {
            field: 'preScore',
            title: '初试总分',
            width: 120,
        },
        {
            field: 'totalScore',
            title: '总成绩',
            width: 120,
        }
        
    ];
    let finalColumns = columns.concat(defineColumn);
    console.log(finalColumns)
    if (gridInstance) {
        $(el).data('kendoGrid').destroy();
        $(el).empty();
    };
    gridInstance = new KendoGrid(el, {
        columns: finalColumns,
        dataSource: gridDatasource,
        change: function () {
            let select = gridInstance.getSelected()
            let selectedId = select.map((v) => {
                return v.id
            })
            console.log(selectedId)
           // memoryStore.set('selectedApplicationData', select);
            memoryStore.set('selectedData', select);
            memoryStore.set('selectedId', selectedId)
            btnEnabled()
        },
        dataBound: function (e) {
            $(el).find(".actionBtn").off().on("click", function () {
                let id = $(this).attr("data-id");
                let applicationId = $(this).attr("data-applicationId");
                let userId = $(this).attr("data-userId")
                let data = gridDatasource.get(id);
                let action = $(this).attr('data-action');
                memoryStore.set('selectedId', id);
                memoryStore.set('selectedApplicationId', applicationId);
                memoryStore.set('selectedUserId', userId);
                memoryStore.set('selectedData', data);
                if (action) {
                    eventBus.trigger(action);
                }
                e.preventDefault()
            })
            $(el).find(".courseName").off().on("click", function () {
                let courseId = $(this).attr("data-id")
                getCourseInfoById({ id: courseId }).then((data) => {
                    console.log(data)
                    let content=''
                    if(data){
                        content=`<div class="content"><p>参考书目：${data.referencesList}</p><p>备注：${data.remarks}</p></div>`
                    }else{
                        content=`找不到该科目`
                    }
                    let tooltip = $(this).find(".content").kendoTooltip({
                        content: function () {
                            return content
                        },
                    }).data("kendoTooltip");
                    tooltip.show($(this).find(".content"));
                })
            })
        },

    });
    gridInstance.init()
}
//button的禁用启用
function btnEnabled() {
    let selected = gridInstance.getSelected();
    if (selected.length > 0) {
        $("#sendBtn").removeAttr("disabled")
    } else {
        $("#sendBtn").attr("disabled", "disabled")
    }
}
$(function () {
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        memoryStore.set('selectedCollegeId', value);
        gridInit("#proposedAdmission_grid")
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        memoryStore.set('selectedCollegeId', value);
        let tabSelect = $('#tabtrip').data("kendoTabStrip").select();
        console.log($(tabSelect).attr("data-type"))
        if ($(tabSelect).attr("data-type") === "proposedAdmission") {
            gridInit("#proposedAdmission_grid")
        }
        if ($(tabSelect).attr("data-type") === "noEntryScore") {
            gridInit("#noEntryScore_grid")
        }
        if ($(tabSelect).attr("data-type") === "notAdmitted") {
            gridInit("#notAdmitted_grid")
        }
    })
    if (!$('#tabtrip').data('kendoTabStrip')) {
        $('#tabtrip').kendoTabStrip({
            activate: function (e) {
                //拟录取
                if ($(e.contentElement).attr("id") === "proposedAdmission_tab") {
                    memoryStore.set('enrollStatus', EnrollstatusObjectInstance.getByValue("Admission", "key").id);
                    defineColumn = [
                        {
                            field: 'healthCheckMethod',
                            title: '体检选择',
                            width: 120,
                            filterable: {
                                ui: function (element) {
                                    let dataSource = HealthCheckMethodObjectInstance.toObjectArray();
                                    element.kendoDropDownList({
                                        dataSource: dataSource,
                                        optionLabel: "--Select Value--",
                                        dataTextField: "value",
                                        dataValueField: "id",
                                    });
                                },
                                operators: {
                                    number: {
                                        eq: 'equal'
                                    },
                                    string: {
                                        eq: 'equal'
                                    }
                                },
                            },
                            template: function (dataItem) {
                                if (HealthCheckMethodObjectInstance.getByValue(dataItem.healthCheckMethod, "id")) {
                                    return HealthCheckMethodObjectInstance.getByValue(dataItem.healthCheckMethod, "id")["value"]
                                } else {
                                    return ""
                                }
                            }
                        },
                        {
                            field: 'healthCheckResult',
                            title: '体检结果',
                            width: 120,
                        },
                        {
                            field: 'enrollmentNotificationMethod',
                            title: '通知书领取方式',
                            width: 180,
                            filterable: {
                                ui: function (element) {
                                    let dataSource = EnrollmentNotificationMethodObjectInstance.toObjectArray();
                                    element.kendoDropDownList({
                                        dataSource: dataSource,
                                        optionLabel: "--Select Value--",
                                        dataTextField: "value",
                                        dataValueField: "id",
                                    });
                                },
                                operators: {
                                    number: {
                                        eq: 'equal'
                                    },
                                    string: {
                                        eq: 'equal'
                                    }
                                },
                            },
                            template: function (dataItem) {
                                if (EnrollmentNotificationMethodObjectInstance.getByValue(dataItem.enrollmentNotificationMethod, "id")) {
                                    return EnrollmentNotificationMethodObjectInstance.getByValue(dataItem.enrollmentNotificationMethod, "id")["value"]
                                } else {
                                    return ""
                                }
                            }
                        }
                    ];
                    gridInit("#proposedAdmission_grid")
                }
                //未录入成绩名单
                if ($(e.contentElement).attr("id") === "noEntryScore_tab") {
                    memoryStore.set('enrollStatus', EnrollstatusObjectInstance.getByValue("NoEntered", "key").id)
                    defineColumn = [
                        //{
                        //    field: 'ifCome',
                        //    title: '是否来参加面试',
                        //    width: 180,
                        //    template: function (dataItem) {
                        //        return BooleanTemplate(dataItem.ifCome)
                        //    },
                        //    filterable: {
                        //        ui: function (element) {
                        //            let dataSource = [
                        //                { name: "已参加", value: "true" },
                        //                { name: "未未参加", value: "false" },
                        //                { name: "无", value: null }
                        //            ]
                        //            element.kendoDropDownList({
                        //                dataSource: dataSource,
                        //                optionLabel: "--Select Value--",
                        //                dataTextField: "name",
                        //                dataValueField: "value",
                        //            });
                        //        },
                        //        operators: {
                        //            number: {
                        //                eq: 'equal'
                        //            },
                        //            string: {
                        //                eq: 'equal'
                        //            }
                        //        },
                        //    },
                        //},
                    ];
                    gridInit("#noEntryScore_grid")
                }
                //未录取名单
                if ($(e.contentElement).attr("id") === "notAdmitted_tab") {
                    memoryStore.set('enrollStatus', EnrollstatusObjectInstance.getByValue("NotAdmmited", "key").id);
                    defineColumn = [
                        //{
                        //    field: 'ifCome',
                        //    title: '是否来参加面试',
                        //    width: 180,
                        //    template: function (dataItem) {
                        //        return BooleanTemplate(dataItem.ifCome)
                        //    },
                        //    filterable: {
                        //        ui: function (element) {
                        //            let dataSource = [
                        //                { name: "已参加", value: "true" },
                        //                { name: "未未参加", value: "false" },
                        //                { name: "无", value: null }
                        //            ]
                        //            element.kendoDropDownList({
                        //                dataSource: dataSource,
                        //                optionLabel: "--Select Value--",
                        //                dataTextField: "name",
                        //                dataValueField: "value",
                        //            });
                        //        },
                        //        operators: {
                        //            number: {
                        //                eq: 'equal'
                        //            },
                        //            string: {
                        //                eq: 'equal'
                        //            }
                        //        },
                        //    },
                        //},
                    ];
                    gridInit("#notAdmitted_grid")
                }
            }
        });
    }
    eventBus.on(actions.refresh, function () {
        gridDatasource.read();
    })
    $("#failed_reset_btn").off().on("click", function () {
        resetAuditConfirmWindow.open(memoryStore.get('selectedId'))
    })
    $("#success_reset_btn").off().on("click", function () {
        resetAuditConfirmWindow.open(memoryStore.get('selectedId'))
    })
    $("#importBtn").off().on("click", function () {
        eventBus.trigger(actions.importResult)
    })
    //下载导入模板
    let downLoadTemp = new fileDownLoader("#downLoadTempBtn", {
        url: '/admin/Result/DownloadTemplate',
        method: 'get'
    });
    downLoadTemp.init();
    //导出全部
    let downLoadResult = new fileDownLoader("#downLoadResultBtn", {
        url: '/admin/Result/Export',
        method: 'get'
    });
    downLoadResult.init();
    //发送消息
    $("#sendBtn").off().on("click", function () {
        if (!sendMsgWindow) {
            sendMsgWindow = new SendMsgWindow("#sendMsgWindow", {
                messageNode: MessageNodeObjectInstance.getByValue("examinationResult", "key").id,
                sendCallback: function () {
                    gridDatasource.read();
                }
            })
            sendMsgWindow.init()
        }
        sendMsgWindow.open()
    })
    //导出当前
    let downLoadFilterResult = new fileDownLoader("#downLoadResultByFilter", {
        url:`/admin/Result/ExportResult`,
        method: 'get'
    });
    $("#downLoadResultByFilter").on("click",function () {
        let options=null;
        let activeTab=$('#tabtrip').data('kendoTabStrip').select()
        console.log($(activeTab).attr("data-type"))
        if($(activeTab).attr("data-type")==="proposedAdmission"){
            options=$('#proposedAdmission_grid').data('kendoGrid').getOptions();
        }
        if($(activeTab).attr("data-type")==="noEntryScore"){
            options=$('#noEntryScore_grid').data('kendoGrid').getOptions();
        }
        if($(activeTab).attr("data-type")==="notAdmitted"){
            options=$('#notAdmitted_grid').data('kendoGrid').getOptions();
        }
        let param = `TargetSchoolId=${$("#schoolSelector").val() ? $("#schoolSelector").val() : ""}&TargetCollegeId=${$("#collegeSelector").val() ? $("#collegeSelector").val() : ""}&enrollStatus=${memoryStore.get('enrollStatus')}`
        let filters=options.dataSource.filter?options.dataSource.filter.filters:options.dataSource.filter
        console.log(filters)
        if(filters&&Array.isArray(filters)){
            if(filters.length>0){
                for(let i=0;i<filters.length;i++){
                    param+=`&${filters[i]['field']}=${filters[i]['value']}`
                }
            }
        }

        downLoadFilterResult.download(param);
    })
})