import { Form } from "../../../component/form";
import { KendoGrid } from '../../../component/kendo/grid';
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection';
import { GlobalEventName } from '../../../common/globalEventName';
import { addSchedule, editSchedule } from '../../../controller/retestManagement/examinationSchedule';
import { getCourseInfoById } from '../../../controller/systemSetting/course';
import { getBeforeScheduleList } from '../../../controller/retestManagement/applicationReview';
import { getMajorDropdownList } from '../../../controller/systemSetting/major';
import { getCourseSelectList } from '../../../controller/systemSetting/course'
import { getApplicationCount, getScheduleGetById } from '../../../controller/retestManagement/examinationSchedule';
import { TestTypeObjectInstance } from '../../../objectValue/retestManagement/testType';
import { ScheduleStatusObjectInstance } from '../../../objectValue/retestManagement/scheduleStatus';
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType';
let eventBus = memoryStore.get('globalEvent');
let addDto = ApiCollection['post/admin/Schedule/Create'].reqDto;

let addForm = null;
let testTypeDataSource = TestTypeObjectInstance.toObjectArray()
let testTypeDropdownList = null;
let gridDataSource = null;
let candidateGrid = null;
let selectedArray = [];
let scheduleId = window.location.search.split("=")[1];
let pageStatus = "add";//默认是添加状态，编辑状态带id
if (scheduleId) {
    pageStatus="edit"
}


function testTypeDropdownInit() {
    if (!testTypeDropdownList) {
        testTypeDropdownList = $("#addFrom").find('[name="type"]').kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: testTypeDataSource,
            index: 0,
            change: function () {
                gridDataSource.read()
                selectedListRend([])
                selectedArray = []
            }
        }).data("kendoDropDownList")
    }
    //不能编辑复试类型
    if (pageStatus === "edit") {
        testTypeDropdownList.enable(false)
    }
}
//已选列表渲染
function selectedListRend(data) {
    let itemDom = '';
    let headerDom = ` <dt class="row"><span class="header_sort col-lg-2">序号</span><span class="header_name col-lg-2">姓名</span><span class="header_remark col-lg-3">备注</span><span class="header_action col-lg-3">操作</span></dt>`
    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            //第一条数据不能上移
            let moveBtn = `<button class="k-button k-icon-button moveUpBtn" title="上移" data-index="${i}"></button><button class="k-button k-icon-button moveDownBtn" title="下移" data-index="${i}"></button>`;
            if (i === 0) {
                moveBtn = `<button class="k-button k-icon-button moveDownBtn" title="下移" data-index="${i}"></button>`;
            }
            //最后一条数据不能下移
            if (i === data.length - 1) {
                moveBtn = `<button class="k-button k-icon-button moveUpBtn" title="上移" data-index="${i}"></button>`;
            }
            if (data.length === 1) {
                moveBtn = ``;
            }
            itemDom += `<dd class="row"><span class="sort col-lg-2">${i + 1}</span><a class="col-lg-2" href="/admin/candidateDetail?id=${data[i].userId}&applyid=null&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--main-h);text-decoration: underline!important;">${data[i].userName}</a><span class="remarkWrap col-lg-3"><span class="remark">${data[i].remarks}</span><input type="text" class="remarkInput"/></span><span class="action col-lg-5"><button class="k-button k-icon-button errorIconBtn" data-id=${data[i].applicationId} title="删除"></button>${moveBtn}<button class="k-button k-icon-button editBtn" title="编辑备注"></button><button class="k-button k-icon-button saveIconBtn hidden" data-id=${data[i].applicationId} title="保存备注"></button></span></dd>`
        }
        $(".selectedWrap dl").empty().append(`${headerDom}${itemDom}`);
    } else {
        $(".selectedWrap dl").empty().append(`<dt>暂无数据</dt>`)
    }
    
    //删除按钮
    $(".selectedWrap").find(".errorIconBtn").off().on("click", function () {
        let id = $(this).attr("data-id");
        arrActions.remove(id, selectedArray)
        selectedListRend(selectedArray)
    })
    //上移按钮
    $(".selectedWrap").find(".moveUpBtn").off().on("click", function () {
        let index = parseInt($(this).attr("data-index"));
        arrActions.moveUp(selectedArray, index)
        selectedListRend(selectedArray)
    })
    //下移按钮
    $(".selectedWrap").find(".moveDownBtn").off().on("click", function () {
        let index = parseInt($(this).attr("data-index"));
        arrActions.moveDown(selectedArray, index)
        selectedListRend(selectedArray)
    })
    //编辑备注按钮
    $(".selectedWrap").find(".editBtn").off().on("click", function () {
        console.log($(this).parents("dd").find(".remark").text())
        let text = $(this).parents("dd").find(".remark").text();
        console.log($(this).parents("dd").find(".remarkInput"))
        //显示编辑框
        $(this).parents("dd").find(".remarkInput").show().val(text)
        $(this).hide().parent().find(".saveIconBtn").show()
    })
    //保存备注按钮
    $(".selectedWrap").find(".saveIconBtn").off().on("click", function () {
        let id=$(this).attr("data-id")
        let val = $(this).parents("dd").find(".remarkInput").val();
        selectedArray = selectedArray.map((v) => {
            if (v.applicationId === id) {
                v.remarks = val
            }
            return v
        })
        //显示备注
        $(this).parents("dd").find(".remarkInput").hide();
        $(this).parents("dd").find(".remark").text(val).show()
        $(this).hide().parent().find(".editBtn").show()
    })
}
let arrActions = {
    //删除
    remove: function (id,arr) {
        for (let i = 0; i < arr.length; i++) {
            if (id === arr[i]["applicationId"]) {
                arr.splice(i,1)
            }
        }
    },
    //上移
    moveUp: function (arr, index) {
        if (arr.length > 1 && index !== 0) {

            arrActions.swapItems(arr, index, index - 1)

        }
    },
    //下移
    moveDown: function (arr, index) {
        if (arr.length > 1 && index !== (arr.length - 1)) {

           arrActions.swapItems(arr, index, index + 1)

        }
    },
    //交换顺序
    swapItems: function (arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0]
        arr.map(function (v, index) {
            v["order"] = index + 1;
            return v
        })
        return arr

    }
}
//表格渲染
function gridInit() {
    gridDataSource = getBeforeScheduleList().mergeQuery(function () {
        let type = $("#addFrom").find('[name="type"]').val();
        let scheduleStatus = null;
        if (parseInt(type) === TestTypeObjectInstance.getByValue("interview", "key")["id"]) {
            scheduleStatus = ScheduleStatusObjectInstance.getByValue("WaitInterview", "key")["id"]
        } else {
            scheduleStatus = ScheduleStatusObjectInstance.getByValue("WaitWrittenExamination", "key")["id"]
        }
        return {
            targetSchoolId: memoryStore.get('selectedSchoolId'),
            targetCollegeId: memoryStore.get('selectedCollegeId'),
            scheduleStatus: scheduleStatus
        }
    }).dataSource;
    if (candidateGrid) {
        $("#grid").data('kendoGrid').destroy();
        $("#grid").empty();
    };
    candidateGrid = new KendoGrid('#grid', {
        columns: [
            {
                field: 'userName',
                title: '考生姓名',
                width: 120,
                template: function (dataItem) {
                    return `<a href="/admin/candidateDetail?id=${dataItem.userId}&applyid=null&schoolId=${memoryStore.get('selectedSchoolId')}&collegeId=${memoryStore.get('selectedCollegeId')}" target="_blank" style="color: var(--main-h);text-decoration: underline!important;">${dataItem.userName}</a>`
                }
            },
            {
                field: 'candidateNumber',
                title: '考生编号',
                width: 150
            },
            {
                field: 'majorId',
                title: '专业',
                width: 150,
                filterable: {
                    ui: function (element) {
                        let dataSource = getMajorDropdownList().mergeQuery(function () {
                            return {
                                schoolId: memoryStore.get('selectedSchoolId'),
                                collegeId: memoryStore.get('selectedCollegeId'),
                            }
                        }).dataSource;
                        element.kendoDropDownList({
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
                    if (dataItem.majorName) {
                        return `${dataItem.majorName}`
                    } else {
                        return '暂无数据'
                    }
                }
            },
            {
                field: 'courseId',
                title: '科目',
                width: 150,
                filterable: {
                    ui: function (element) {
                        let dataSource = getCourseSelectList().mergeQuery(function () {
                            return {
                                page: 1,
                                pageSize:10000,
                                schoolId: memoryStore.get('selectedSchoolId'),
                                collegeId: memoryStore.get('selectedCollegeId'),
                            }
                        }).dataSource;
                        element.kendoDropDownList({
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
                    return `<span style="color:var(--sub-h);cursor: pointer;" class="courseName" data-id="${dataItem.courseId}">${dataItem.courseName}<span class="content"></span></span>`
                }
            },
            {
                field: 'studyType',
                title: '学习类型',
                width: 120,
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
                        return ""
                    }

                }
            },
        ],
        selectable: true,
        height: 400,
        dataSource: gridDataSource,
        change: function (e) {
            console.log(memoryStore.get('selectedData'))
            let selected = candidateGrid.getSelected();
            selected[0].remarks = ""
            //如果已经选择了则不能再选
            for (let i = 0; i < selectedArray.length; i++) {
                if (selected[0].id === selectedArray[i].applicationId) {
                    alert("该考生已经选过啦！")
                    return
                }

            }
            selectedArray.push({ applicationId: selected[0].id, order: 0, remarks: "", userId: selected[0].userId, userName: selected[0].userName})
            selectedListRend(selectedArray)
            console.log(selectedArray)

        },
        dataBound: function (e) {
            $("#grid").find(".courseName").off().on("click", function () {
                event.stopPropagation();
                let courseId = $(this).attr("data-id")
                getCourseInfoById({ id: courseId }).then((data) => {
                    console.log(data)
                    let tooltip = $(this).find(".content").kendoTooltip({
                        content: function () {
                            return `<div class="content"><p>参考书目：${data.referencesList}</p><p>备注：${data.remarks}</p></div>`
                        },
                    }).data("kendoTooltip");
                    tooltip.show($(this).find(".content"));
                })
            })
        }

    });
    candidateGrid.init()
}
//统计部分渲染
function staticPartRend() {
    let param = {
        "targetSchoolId": memoryStore.get('selectedSchoolId'),
        "targetCollegeId": memoryStore.get('selectedCollegeId')
    }
    getApplicationCount(param).then((data) => {
        $(".writtenNumber").text(data.waitWrittenExamination);
        $(".faceNumber").text(data.waitInterview);
        //$(".arrangementNumber").text(data.arranged);
    })
}
//编辑状态下对已绑定的考生根据sort排序规整数据
function compare(key) {
    return function (value1, value2) {
        return value1[key] - value2[key];
    }
}
//规整要发过去的参数
function paramFilter() {
    let add = [];
    let del=[];
    let update = [];
    let getSelected = memoryStore.get('selectedData');
    let getSelectedId = [];
    let selectedId = [];
    for (let i = 0; i < selectedArray.length; i++) {
        selectedId.push(selectedArray[i]["applicationId"])
    }
    for (let j = 0; j < getSelected.length; j++) {
        getSelectedId.push(getSelected[j]["applicationId"])
    }
    //找出两个数组不同的id
    let newArr = getSelectedId.concat(selectedId).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);

    });
    for (let i = 0; i < selectedArray.length; i++) {
        for (let j = 0; j < getSelected.length; j++) {
            if (selectedArray[i]["applicationId"] === getSelected[j]["applicationId"]) {
                if (selectedArray[i]["order"] !== getSelected[j]["order"] || selectedArray[i]["remarks"] !== getSelected[j]["remarks"]) {
                    selectedArray[i]["order"] = i + 1;
                    update.push(selectedArray[i])
                }
            }
        }
    }
    //将不同的id与已绑定的数组比较，如果在已绑定的数组里可以找到该id，则是delete，如果找不到则是add
    for (let j = 0; j < newArr.length; j++) {
        if (getSelectedId.indexOf(newArr[j]) > -1) {
            for (let k = 0; k < getSelected.length; k++) {
                if (getSelected[k]['applicationId'] === newArr[j]) {
                    del.push(getSelected[k].applicationId)
                }
            }

        } else {
            for (let k = 0; k < selectedArray.length; k++) {
                if (selectedArray[k]['applicationId'] === newArr[j]) {
                    selectedArray[k]["order"] = k + 1;
                    add.push(selectedArray[k])
                }
            }
        }

    }
    console.log(add, update, del)
    return {
        add: add,
        update: update,
        del:del
    }
}
//编辑状态下
$(function () {
    $('#startTimeSelector').kendoDateTimePicker();
    $('#endTimeSelector').kendoDateTimePicker();
    testTypeDropdownInit()
    addForm = new Form('#addFrom', {
        dto: addDto,
        onSubmit: function () {
            let t = addForm.getValue();
            let applicationArr = []
            t.schoolId = memoryStore.get('selectedSchoolId');
            t.collegeId = memoryStore.get('selectedCollegeId');
            if (pageStatus === "edit") {
                let param = paramFilter();
                t.id = scheduleId;
                t.add = param.add;
                t.delete = param.del;
                t.edit = param.update;
                console.log(t)
                editSchedule(t).then((data) => {
                    window.location.href = `/admin/AddExaminationSchedule?id=${t.id}`
                }).catch((error) => {
                })
            } else {
                for (let i = 0; i < selectedArray.length; i++) {
                    let obj = {}
                    obj.applicationId = selectedArray[i].applicationId;
                    obj.userId = selectedArray[i].userId;
                    obj.order = i + 1;
                    obj.remarks = selectedArray[i].remarks;
                    applicationArr.push(obj)
                }
                t.applications = applicationArr
                console.log(t)
                console.log(selectedArray)
                addSchedule(t).then((data) => {
                    window.location.href = `/admin/ExaminationSchedule`
                }).catch((error) => {
                })
            }
        }
    });
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        memoryStore.set('selectedCollegeId', value);
        let college = memoryStore.get("selectedCollegeId");
        staticPartRend()
        if (pageStatus === "edit") {
            getScheduleGetById({ id: scheduleId }).then((data) => {
                addForm.setValue(data)
                let group = data.scheduleGroupDatas;
                let sortGroup = group.sort(compare("order"))
                //编辑状态下学校和学院不能选择
                $("#schoolSelector").data("kendoDropDownList").value(data.schoolId)
                $(".collegeSelectorBox .k-input").text(data.collegeName)
                //$("#collegeSelector").data("kendoDropDownList").value(data.collegeId)
                $("#schoolSelector").data("kendoDropDownList").enable(false);
                $("#collegeSelector").data("kendoDropDownList").enable(false);
                memoryStore.set('selectedSchoolId', data.schoolId);
                memoryStore.set('selectedCollegeId', data.collegeId);
                memoryStore.set('selectedData', group);
                gridInit()
                selectedListRend(sortGroup)
                let newArr = []
                for (let i = 0; i < group.length; i++) {
                    let obj = {
                        applicationId: group[i].applicationId,
                        id: group[i].id,
                        order: group[i].order,
                        remarks: group[i].remarks,
                        userId: group[i].userId,
                        userName: group[i].userName
                    }
                    newArr.push(obj)
                }
                selectedArray = newArr
            })
        } else {
            gridInit()
        }
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        memoryStore.set('selectedCollegeId', value);
        staticPartRend()
        gridInit()
        selectedListRend([])
        selectedArray=[]
        //if (pageStatus === "edit") {
        //    getScheduleGetById({ id: scheduleId }).then((data) => {
        //        addForm.setValue(data)
        //        let group = data.scheduleGroupDatas;
        //        let sortGroup = group.sort(compare("order"))
        //        //编辑状态下学校和学院不能选择
        //        $("#schoolSelector").data("kendoDropDownList").value(data.schoolId)
        //        $("#collegeSelector").data("kendoDropDownList").value(data.collegeId)
        //        $("#schoolSelector").data("kendoDropDownList").enable(false);
        //        memoryStore.set('selectedSchoolId', data.schoolId);
        //        memoryStore.set('selectedCollegeId', data.collegeId);
        //        memoryStore.set('selectedData', group);
        //        gridInit()
        //        selectedListRend(sortGroup)
        //        let newArr=[]
        //        for (let i = 0; i < group.length; i++) {
        //            let obj = {
        //                applicationId: group[i].applicationId,
        //                id: group[i].id,
        //                order: group[i].order,
        //                remarks: group[i].remarks,
        //                userId: group[i].userId,
        //                userName: group[i].userName
        //            }
        //            newArr.push(obj)
        //        }
        //        selectedArray = newArr
        //    })
        //} else {
            
        //}
    })
    
});
