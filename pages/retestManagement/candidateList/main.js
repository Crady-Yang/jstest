import { KendoGrid } from '../../../component/kendo/grid';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { getMajorDropdownList } from '../../../controller/systemSetting/major';
import { getCourseSelectList } from '../../../controller/systemSetting/course';
import { getCandidateList } from '../../../controller/user';
import { GlobalEventName } from '../../../common/globalEventName';
import { fileDownLoader } from '../../../component/downloadFile';
import { ApplicationStatusObjectInstance } from '../../../objectValue/retestManagement/applicationStatus';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType';
//import './sendMsg'
import { SendMsgWindow } from '../../../component/sendMsgWindow'
import {ExaminationTypeObjectInstance} from "../../../objectValue/retestManagement/examinationType";
let eventBus = memoryStore.get('globalEvent');
let candidateGrid = null;
let majorSelector = null;
let approveTimeStartSelector = null;
let approveTimeEndSelector = null;
let gridDatasource = null;
let sendMsgWindow=null
//专业下拉框
function majorDropdownInit() {
    let dataSource = getMajorDropdownList().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if(majorSelector){
        $(".majorSelector").empty().append('<input id="professionSelector" name="professionId" />')
    }
    majorSelector = $("#professionSelector").kendoDropDownList({
        dataTextField: "name",
        dataValueField: "id",
        dataSource: dataSource,
        optionLabel: "请选择专业",
        change: function () {
            memoryStore.set('selectedMajorId', majorSelector.value());
        }
    }).data("kendoDropDownList")
}
//时间筛选
function creationTimeInit() {
    if (!approveTimeStartSelector) {
        approveTimeStartSelector = $('#startTimeSelector').kendoDateTimePicker({
            format: '{0: yyyy-MM-dd HH:mm:ss}',
        }).data("kendoDateTimePicker")
    }
    if (!approveTimeEndSelector) {
        approveTimeEndSelector = $('#endTimeSelector').kendoDateTimePicker({
            format: '{0: yyyy-MM-dd HH:mm:ss}',
        }).data("kendoDateTimePicker")
    }
}
function gridInit() {
    gridDatasource = getCandidateList().mergeQuery(function () {
        return {
            targetSchoolId: memoryStore.get('selectedSchoolId'),
            targetCollegeId: memoryStore.get('selectedCollegeId'),
            targetMajorId: majorSelector.value(),
            creationTimeStart: approveTimeStartSelector.value() ? moment(approveTimeStartSelector.value()).format('YYYY-MM-DD HH:mm:ss') : '',
            creationTimeEnd: approveTimeEndSelector.value() ? moment(approveTimeEndSelector.value()).format('YYYY-MM-DD HH:mm:ss') : ''
        }
    }).dataSource;
    if (candidateGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    candidateGrid = new KendoGrid('#grid', {
        columns: [
            {
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
                field: 'name',
                title: '姓名',
                width: 150,
                template: function (dataItem) {
                    return `<a href="/admin/candidateDetail?id=${dataItem.id}&applyid=null&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--main-h);text-decoration: underline!important;">${dataItem.name}</a>`
                }
            },
            {
                field: 'candidateNumber',
                title: '考生编号',
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
            {
                field: 'mobile',
                title: '手机号码',
                width: 180,
            },
            
            {
                field: 'gender',
                title: '性别',
                width: 100,
                template: function (dataItem) {
                    if (dataItem.gender) {
                        return "女"
                    } else {
                        return "男"
                    }
                },
                filterable: {
                    messages: {
                        isTrue: "女",
                        isFalse: "男"
                    }
                }
            },
            {
                field: 'isFreshGraduate',
                title: '是否应届生',
                width: 150,
                template: function (dataItem) {
                    return BooleanTemplate(dataItem.isFreshGraduate)
                },
                filterable: {
                    messages: {
                        isTrue: "是",
                        isFalse: "否"
                    }
                }
            },
            {
                field: 'applicationStatus',
                title: '初审结果',
                width: 120,
                filterable: {
                    ui: function (element) {
                        let dataSource = ApplicationStatusObjectInstance.toObjectArray();
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
                    if (ApplicationStatusObjectInstance.getByValue(dataItem.applicationStatus, "id")) {
                        return ApplicationStatusObjectInstance.getByValue(dataItem.applicationStatus, "id")["value"]
                    } else {
                        return ""
                    }
                }
            },
            {
                field: 'isArrangeInterview',
                title: '是否安排面试',
                width: 150,
                template: function (dataItem) {
                    return BooleanTemplate(dataItem.isArrangeInterview)
                },
                filterable: {
                    messages: {
                        isTrue: "是",
                        isFalse: "否"
                    }
                }
            },
            {
                field: 'isArrangeWrittenExamination',
                title: '是否安排笔试',
                width: 150,
                template: function (dataItem) {
                    return BooleanTemplate(dataItem.isArrangeWrittenExamination)
                },
                filterable: {
                    messages: {
                        isTrue: "是",
                        isFalse: "否"
                    }
                }
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
                title: '总分',
                width: 100,
            },
            {
                field: 'ifEnroll',
                title: '拟录取',
                width: 100,
                template: function (dataItem) {
                    return BooleanTemplate(dataItem.ifEnroll)
                },
                filterable: {
                    ui: function (element) {
                        let dataSource = [
                            { name: "已录取", value: "true" },
                            { name: "未录取", value: "false"},
                            { name: "无", value: null }
                        ]
                        element.kendoDropDownList({
                            dataSource: dataSource,
                            optionLabel: "--请选择--",
                            dataTextField: "name",
                            dataValueField: "value",
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
            },
        ],
        dataSource: gridDatasource,
        dataBound: function (e) {
            console.log(e)
        },
        change: function () {
            let selected = candidateGrid.getSelected();
            if (selected.length) {
                $("#sendMsgBtn").removeAttr("disabled")
            } else {
                $("#sendMsgBtn").attr("disabled", "disabled")
            }
            memoryStore.set('selectedData', selected)
        }
    });
    candidateGrid.init()
}

$(function () {
    creationTimeInit()
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        majorDropdownInit();
        gridInit();
        memoryStore.set('selectedMajorId', majorSelector.value());

    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        majorDropdownInit();
        gridInit();
        memoryStore.set('selectedMajorId', majorSelector.value());
    })
    $("#searchBtn").off().on("click", function () {
        gridInit();
    })
    $("#sendMsgBtn").off().on("click", function () {
        if (!sendMsgWindow) {
            sendMsgWindow = new SendMsgWindow("#sendWindow", {
                messageNode: MessageNodeObjectInstance.getByValue("other", "key").id,
                ifShowMsgType: true,
                sendCallback: function () {
                    gridInit();
                }
            })
            sendMsgWindow.init()
        }
        sendMsgWindow.open()
    })
})
//导出全部
let downLoadAllResult = new fileDownLoader("#downLoadResultBtn", {
    url: '/admin/Result/Export',
    method: 'get'
});
downLoadAllResult.init();
//导出当前
let downLoadFilterResult = new fileDownLoader("#downLoadResultByFilter", {
    url:`/admin/User/ExportCandidate`,
    method: 'get'
});
$("#downLoadResultByFilter").on("click",function () {
    let param=`TargetSchoolId=${$("#schoolSelector").val()?$("#schoolSelector").val():""}&TargetCollegeId=${$("#collegeSelector").val()?$("#collegeSelector").val():""}&TargetMajorId=${majorSelector.value()?majorSelector.value():""}&creationTimeStart=${approveTimeStartSelector.value() ? moment(approveTimeStartSelector.value()).format('YYYY-MM-DD HH:mm:ss') : ''}&creationTimeEnd=${approveTimeEndSelector.value() ? moment(approveTimeEndSelector.value()).format('YYYY-MM-DD HH:mm:ss') : ''}`
    let options=$('#grid').data('kendoGrid').getOptions();
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
//导出图片
let downLoadAllPicture= new fileDownLoader("#downLoadPictureBtn", {
    url: '/admin/Application/ExportExamineePictures',
    method: 'post'
});
downLoadAllPicture.init();

