import { KendoGrid } from '../../../component/kendo/grid';
import { getApplicationList, resetApplication} from '../../../controller/retestManagement/applicationReview';
import { getMajorDropdownList } from '../../../controller/systemSetting/major';
import { getCourseSelectList } from '../../../controller/systemSetting/course';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { actions } from "./actions";
import { ApplicationStatusObjectInstance } from '../../../objectValue/retestManagement/applicationStatus';
import { ExaminationTypeObjectInstance } from '../../../objectValue/retestManagement/examinationType';
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType';
import "./auditWindow";
let eventBus = memoryStore.get('globalEvent');
let majorSelector = null;
let approveTimeStartSelector = null;
let approveTimeEndSelector = null;
let gridInstance = null;
let defineColumn = [];
let actionColumn = [
    {
        field: "id",
        title: "操作",
        filterable: false,
        width: 120,
        template: function (item) {
            return `<button class="k-button k-icon-button editBtn" data-id=${item.id} data-action="${actions.editApplication}">修改申请</button>`

        }
    },
]
let gridDatasource = null;

//默认显示待审核列表
memoryStore.set('applicationStatus', ApplicationStatusObjectInstance.getByValue("WaitAudit", "key").id)


//专业下拉框
function majorDropdownInit() {
    let dataSource = getMajorDropdownList().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if (!majorSelector) {
        majorSelector=$("#professionSelector").kendoDropDownList({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: dataSource,
            optionLabel: "请选择专业",
        }).data("kendoDropDownList")
    }
}
//时间筛选
function applicateTimeInit() {
    if (!approveTimeStartSelector) {
        approveTimeStartSelector = $('#applicateStartTimeSelector').kendoDateTimePicker({
            format: '{0: yyyy-MM-dd HH:mm:ss}',
        }).data("kendoDateTimePicker")
    }
    if (!approveTimeEndSelector) {
        approveTimeEndSelector = $('#applicateEndTimeSelector').kendoDateTimePicker({
            format: '{0: yyyy-MM-dd HH:mm:ss}',
        }).data("kendoDateTimePicker")
    }
}
//按钮禁用启用
function btnEnable(gridEl) {
    let gridSelected = $(gridEl).data('kendoGrid').select();
    console.log(gridSelected)
    if (gridSelected.length > 0) {
        $(gridEl).parent().find(".actionBtn").removeAttr("disabled")
    } else {
        $(gridEl).parent().find(".actionBtn").attr("disabled", "disabled")
    }

}
//表格渲染
function gridInit(el) {
    gridDatasource = getApplicationList().mergeQuery(function () {
        return {
            status: memoryStore.get('applicationStatus'),
            targetSchoolId: memoryStore.get('selectedSchoolId'),
            targetCollegeId: memoryStore.get('selectedCollegeId'),
            targetMajorId: majorSelector.value(), 
            creationTimeStart: approveTimeStartSelector.value()?moment(approveTimeStartSelector.value()).format('YYYY-MM-DD HH:mm:ss'):'',
            creationTimeEnd: approveTimeEndSelector.value()?moment(approveTimeEndSelector.value()).format('YYYY-MM-DD HH:mm:ss'):''
        }
    }).dataSource;
    gridInstance = $(el).data('kendoGrid')
    let columns = [{
        selectable: true,
        width: 50
    },
        {field:'localIndex'},
    {
        field: 'userName',
        title: '考生姓名',
        width: 120,
        template: function (dataItem) {
            return `<a href="/admin/candidateDetail?id=${dataItem.userId}&applyid=${dataItem.id}&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--main-h);text-decoration: underline!important;
;">${dataItem.userName}</a>`
        }
    },
        {
            field: 'candidateNumber',
            title: '编号',
            width: 180,
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
            field: 'targetMajorId',
            title: '复试专业',
            width: 180,
            filterable: {
                ui: function (element) {
                    let dataSource = getMajorDropdownList().mergeQuery(function () {
                        return {
                            schoolId: memoryStore.get('selectedSchoolId'),
                            collegeId: memoryStore.get('selectedCollegeId')
                        }
                    }).dataSource;
                    element.kendoDropDownList({
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
                if (dataItem.majorName) {
                    return `${dataItem.majorName}`
                } else {
                    return '暂无数据'
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
            template:function (dataItem) {
                if (dataItem.studyType!==null) {
                    return StudyTypeObjectInstance.getByValue(dataItem.studyType, "id")["value"]
                } else {
                    return ''
                }
            }
        },
        {
            field: 'examinationCourseId',
            title: '复试科目',
            width: 150,
            filterable: {
                ui: function (element) {
                    let dataSource = getCourseSelectList().mergeQuery(function () {
                        return {
                            page: 1,
                            pageSize: 100000,
                            schoolId: memoryStore.get('selectedSchoolId'),
                            collegeId: memoryStore.get('selectedCollegeId')
                        }
                    }).dataSource;
                    element.kendoDropDownList({
                        dataSource: dataSource,
                        optionLabel: "--Select Value--",
                        dataTextField: "name",
                        dataValueField: "id",
                        change: function () {

                        }
                    }).data("kendoDropDownList");
                },
            },
            template: function (dataItem) {
                if (dataItem.courseName) {
                    return `${dataItem.courseName}`
                } else {
                    return '暂无数据'
                }
            }
        },
    //{
    //    field: 'ifRequest',
    //    title: '是否申请调剂',
    //    width: 120,
    //    template: function (dataItem) {
    //        return BooleanTemplate(dataItem.ifRequest)
    //    },
    //    filterable: {
    //        messages: {
    //            isTrue: "是",
    //            isFalse: "否"
    //        }
    //    }
    //},
    // {
    //     field: 'ifReceive',
    //     width:230,
    //     title: '是否收到调剂复试通知',
    //     template: function (dataItem) {
    //         return BooleanTemplate(dataItem.ifReceive)
    //     },
    //     filterable: {
    //         messages: {
    //             isTrue: "是",
    //             isFalse: "否"
    //         }
    //     }
    // },
    //{
    //    field: 'creationTime',
    //    title: '创建时间',
    //    width: 150,
    //    format: "{0: yyyy-MM-dd HH:mm:ss}"
    //},
    ];
    let finalColumns = columns.concat(defineColumn)
    console.log(finalColumns)
    if (gridInstance) {
        $(el).data('kendoGrid').destroy();
        $(el).empty();
    };
    gridInstance = new KendoGrid(el, {
        columns: finalColumns,
        dataSource: gridDatasource,
        change: function () {
            console.log(gridInstance)
            let select = gridInstance.getSelected()
            let selectedId = select.map((v) => {
                return v.id
            })
            console.log(selectedId)
            memoryStore.set('selectedApplicationData', select);
            memoryStore.set('selectedId', selectedId)
            btnEnable(el)
        },
        dataBound: function (e) {
            btnEnable(el)
        },

    });
    gridInstance.init()
    
    
}
$(function () {
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        memoryStore.set('selectedCollegeId', value);
        majorDropdownInit()
        memoryStore.set('selectedMajorId', majorSelector.value());
        gridInit("#waitAudit_grid")
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        memoryStore.set('selectedCollegeId', value);
        majorDropdownInit()
        memoryStore.set('selectedMajorId', majorSelector.value());
        let tabSelect = $('#tabtrip').data("kendoTabStrip").select();
        console.log($(tabSelect).attr("data-type"))
        if ($(tabSelect).attr("data-type") === "waitAudit") {
            gridInit("#waitAudit_grid")
        }
        if ($(tabSelect).attr("data-type") === "auditFailed") {
            gridInit("#auditFailed_grid")
        }
        if ($(tabSelect).attr("data-type") === "auditPass") {
            gridInit("#auditPass_grid")
        }
        if ($(tabSelect).attr("data-type") === "dataUpdate") {
            gridInit("#dataUpdate_grid")
        }
    })
    if (!$('#tabtrip').data('kendoTabStrip')) {
        $('#tabtrip').kendoTabStrip({
            activate: function (e) {
                //待审核
                if ($(e.contentElement).attr("id") === "waitAudit_tab") {
                    memoryStore.set('applicationStatus', ApplicationStatusObjectInstance.getByValue("WaitAudit", "key").id);
                    defineColumn = []
                    gridInit("#waitAudit_grid")
                }
                //审核失败
                if ($(e.contentElement).attr("id") === "auditFailed_tab") {
                    memoryStore.set('applicationStatus', ApplicationStatusObjectInstance.getByValue("AuditFailed", "key").id)
                    defineColumn = [
                        {   
                            field: 'approveTime',
                            title: '审核时间',
                            width: 180,
                            format: "{0: yyyy-MM-dd HH:mm:ss}",
                            filterable: {
                                extra: true,
                                ui: "datetimepicker",
                                messages: {
                                    info: "请选择开始时间和结束时间"
                                },
                                operators: {
                                    date: {
                                        gt: "开始时间",
                                        lt: "结束时间"
                                    }
                                },
                            }
                        },
                        {
                            field: 'approver',
                            title: '审核人',
                            width: 150,
                        },
                        {
                            field: 'approveComment',
                            title: '审核评论',
                            width: 180,
                        },
                    ];
                    gridInit("#auditFailed_grid")
                }
                //审核通过
                if ($(e.contentElement).attr("id") === "auditPass_tab") {
                    memoryStore.set('applicationStatus', ApplicationStatusObjectInstance.getByValue("AuditPass", "key").id);
                    defineColumn = [
                        {
                            format: "{0: yyyy-MM-dd HH:mm:ss}",
                            field: 'approveTime',
                            title: '审核时间',
                            width: 180,
                            filterable: {
                                extra: true,
                                ui: "datetimepicker",
                                messages: {
                                    info: "请选择开始时间和结束时间"
                                },
                                operators: {
                                    date: {
                                        gt: "开始时间",
                                        lt: "结束时间"
                                    }
                                },
                            }
                        },
                        {
                            field: 'approver',
                            title: '审核人',
                            width: 120,
                        },
                        {
                            field: 'approveComment',
                            title: '审核评论',
                            width: 120,
                        },
                        {
                            field: 'scheduleName',
                            title: '复试分组',
                            width: 150,
                        },
                    ];
                    gridInit("#auditPass_grid")
                }
                //资料更新
                if ($(e.contentElement).attr("id") === "dataUpdate_tab") {
                    memoryStore.set('applicationStatus', ApplicationStatusObjectInstance.getByValue("DataUpdate", "key").id);
                    defineColumn = [];
                    gridInit("#dataUpdate_grid")
                }
            }
        });
    }
    applicateTimeInit()
    eventBus.on(actions.refresh, function () {
        gridDatasource.read();
    })
    let resetAuditConfirmWindow = new ConfirmWindow('#resetAuditWindow', {
        type: 'other',
        title: "重置申请",
        content: "确认重置申请吗？",
        onSubmit: resetApplication,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });
    $("#failed_reset_btn").off().on("click", function () {
        resetAuditConfirmWindow.open(memoryStore.get('selectedId'))
    })
    $("#success_reset_btn").off().on("click", function () {
        resetAuditConfirmWindow.open(memoryStore.get('selectedId'))
    })
    $("#dataUpdate_reset_btn").off().on("click", function () {
        resetAuditConfirmWindow.open(memoryStore.get('selectedId'))
    })
    $("#searchBtn").off().on("click", function () {
        gridDatasource.read();
    })
})
