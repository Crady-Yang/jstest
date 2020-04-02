import "babel-polyfill";
import { KendoGrid } from '../../../component/kendo/grid';
import { timeTFormatter } from '../../../common/utils'
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { getUserById, getCandidateById, getRecordsById} from '../../../controller/user';
import { getMessageRecordList } from '../../../controller/systemSetting/messageRecord';
import { GlobalEventName } from '../../../common/globalEventName';
import { ApplicationStatusObjectInstance } from '../../../objectValue/retestManagement/applicationStatus';
import { TestTypeObjectInstance } from '../../../objectValue/retestManagement/testType';
import { languageCourseTypeObjectInstance } from '../../../objectValue/retestManagement/languageCourseType';
import { politicalCourseTypeObjectInstance } from '../../../objectValue/retestManagement/politicalCourseType';
import { EnrollmentNotificationMethodObjectInstance } from '../../../objectValue/retestManagement/enrollmentNotificationMethod';
import { HealthCheckMethodObjectInstance } from '../../../objectValue/retestManagement/healthCheckMethod';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
import { MajorTypeObjectInstance } from '../../../objectValue/systemSetting/majorType';
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType';
import './auditWindow'
import { SendMsgWindow } from '../../../component/sendMsgWindow'

let eventBus = memoryStore.get('globalEvent');
let userId = window.location.search.split("&")[0].split("=")[1];
let applyId = window.location.search.split("&")[1].split("=")[1];
let sendMsgWindow = null
memoryStore.set('selectedData', [{ id: userId}])
async function getUserBaseData() {
    let userData = await getUserById({ "id": userId })
    for (var key in userData) {
        if (userData[key] === null) {
            userData[key] = ""
        }
        if (key === 'birthday') {
            userData[key] = moment(userData[key]).format('YYYY-MM-DD HH:mm:ss')
        }
        if (key === 'gender') {
            if (userData[key]) {
                userData[key] = '女'
            } else {
                userData[key] = '男'
            }
        }
        $("#tabstrip .baseInfo").find(`[name='${key}']`).text(userData[key])
        if (key === "potrait" && userData["potrait"]) {
            $("#tabstrip").find(`[name='${key}']`).attr("src", candidateData[key])
        }
    }
    //应届生显示学生证和成绩单，往届生显示毕业证和学位证
    if (userData["isFreshGraduate"]) {
        $("#tabstrip").find(`[name='isFreshGraduate']`).text("应届生");
        $(".studentCardPictureBox").show();
        $(".scoreCardPictureBox").show();
        $(".graduationCardPictureBox").hide();
        $(".degreeCardPictureBox").hide();
    } else {
        $("#tabstrip").find(`[name='isFreshGraduate']`).text("往届生");
        $(".studentCardPictureBox").hide();
        $(".scoreCardPictureBox").hide();
        $(".graduationCardPictureBox").show();
        $(".degreeCardPictureBox").show();
    }
    
}
async function getUserOtherData() {
    let candidateData = await getCandidateById({ "id": userId });
    if (candidateData) {
        $("#tabstrip").find(`[name='graduationFrom']`).text(candidateData["graduationFrom"]);
        $("#tabstrip").find(`[name='graduationMajor']`).text(candidateData["graduationMajor"]);
        $("#tabstrip").find(`[name='address']`).text(candidateData["address"]);
        $("#tabstrip").find(`[name='zipCode']`).text(candidateData["zipCode"])
        for (var key in candidateData) {
            if (candidateData[key] === null) {
                candidateData[key] = ""
            }
            if (key === "languageCourseType") {
                if (languageCourseTypeObjectInstance.getByValue(candidateData[key], "id")) {
                    candidateData[key] = languageCourseTypeObjectInstance.getByValue(candidateData[key], "id")["value"]

                } else {
                    $("#tabstrip .otherInfo").find(`[name='${key}']`).parent().hide()
                }

            }
            if (key === "politicalCourseType") {
                if (politicalCourseTypeObjectInstance.getByValue(candidateData[key], "id")) {
                    candidateData[key] = politicalCourseTypeObjectInstance.getByValue(candidateData[key], "id")["value"]

                } else {
                    $("#tabstrip .otherInfo").find(`[name='${key}']`).parent().hide()
                }
            }
            if (key === "majorType") {
                if (MajorTypeObjectInstance.getByValue(candidateData[key], "id")) {
                    candidateData[key] = MajorTypeObjectInstance.getByValue(candidateData[key], "id")["value"]

                }
            }
            if (key === "studyType") {
                if (StudyTypeObjectInstance.getByValue(candidateData[key], "id")) {
                    candidateData[key] = StudyTypeObjectInstance.getByValue(candidateData[key], "id")["value"]

                }
            }
            if (key === "firstProfessionalCourseName" && candidateData[key] === "") {
                $("#tabstrip .otherInfo").find(`[name='${key}']`).parent().hide()
            }
            if (key === "secondProfessionalCourseName" && candidateData[key] === "") {
                $("#tabstrip .otherInfo").find(`[name='${key}']`).parent().hide()
            }
            if (key === 'firstIdCardPicture' || key === 'secondIdCardPicture' || key === 'graduationCardPicture' || key === 'degreeCardPicture' || key === 'approveTablePicture') {
                if (!candidateData[key]) {
                    $(`.${key}`).empty().append("<span>无</span>")
                } else {
                    $(`.${key}`).empty().append(`<a href="/${candidateData[key]}" target="_blank" style="background: url('/${candidateData[key]}') no-repeat center/ cover"></a>`)
                }
            } else if (key === 'studentCardPicture' || key === 'scoreCardPicture' || key === 'otherInfoPicture') {
                let pictureList = [];
                let liDom = ``
                if (candidateData[key]) {
                    pictureList = candidateData[key].split(",")
                    for (let i = 0; i < pictureList.length; i++) {
                        liDom += `<li class="pictureBox">
                                <a href="/${pictureList[i]}" target="_blank" style="background: url('/${pictureList[i]}') no-repeat center/ cover"></a>
                            </li>`
                    }
                } else {
                    liDom = `<li>无</li>`
                }
                $("#tabstrip .otherInfo").find(`[name='${key}']`).empty().append(liDom)
            } else {
                $("#tabstrip .otherInfo").find(`[name='${key}']`).text(candidateData[key])

            }

        }
    }
    
    
}
async function examinationDatRend() {
    let examinationData = await getRecordsById({ "id": userId })
    let liDom = ``;
    for (let i = 0; i < examinationData.length; i++) {
        let scheduleDom = ``
        let pictureDom = ``
        for (var key in examinationData[i]) {
            if (examinationData[i][key] === null) {
                examinationData[i][key]=""
            }
        }
        for (let j = 0; j < examinationData[i]["schedules"].length; j++) {
            scheduleDom += `<li><span class="title">复试安排${j + 1}:</span><span>${examinationData[i]["schedules"][j]["scheduleName"] ? examinationData[i]["schedules"][j]["scheduleName"]:""}</span></li>`
        }
        if (examinationData[i]["healthCheckResultPicture"]) {
            let pictureList = examinationData[i]["healthCheckResultPicture"].split(",")
            for (let k = 0; k < pictureList.length; k++) {
                pictureDom += ` <li class="pictureBox">
                                    <a href="/${pictureList[k]}" target="_blank" style="background: url('/${pictureList[k]}') no-repeat center/ cover"></a>
                                </li>`
            }
        } else {
            pictureDom = `<li>无</li>`
        }
        liDom +=`<li class="light-boxShadow">
                        <div><span class="title">复试学校：</span><span name="scheduleSchoolName">${examinationData[i]["schoolName"]}</span></div>
                        <div><span class="title">复试学院：</span><span name="scheduleCollegeName">${examinationData[i]["collegeName"]}</span></div>
                        <div><span class="title">复试专业：</span><span name="majorName">${examinationData[i]["majorName"]}</span></div>
                        <div><span class="title">复试科目：</span><span  name="courseName">${examinationData[i]["courseName"]}</span></div>
                        <div><span class="title">学习类型：</span><span  name="courseName">${StudyTypeObjectInstance.getByValue(examinationData[i]["studyType"], "id")["value"]}</span></div>
                        <div><span class="title">初审：</span><span name="applicationStatus" style="color:${ApplicationStatusObjectInstance.getByValue(examinationData[i]["applicationStatus"], "id")["color"]}">${ApplicationStatusObjectInstance.getByValue(examinationData[i]["applicationStatus"], "id")["value"]}</span></div>
                        
                        <div>
                            <p  class="title">复试安排：</p>
                            <ul class="schedules">
                                ${scheduleDom}
                            </ul>
                        </div>
                        <div>
                            <p class="title">复试成绩：</p>
                            <ul class="score clearfix">
                                <li><span class="title">笔试分:</span><span name="writtenScore">${examinationData[i]["writtenScore"]}</span></li>
                                <li><span class="title">面试分:</span><span name="interviewScore">${examinationData[i]["interviewScore"]}</span></li>
                                <li><span class="title">复试总分:</span><span name="examinationScore">${examinationData[i]["examinationScore"]}</span></li>
                                <li><span class="title">总分:</span><span name="totalScore">${examinationData[i]["totalScore"]}</span></li>
                                <li><span class="title">是否录取:</span><span name="ifEnroll">${BooleanTemplate(examinationData[i].ifEnroll)}</span></li>
                                <li><span class="title">体检方式:</span><span name="healthCheckMethod">${examinationData[i]["healthCheckMethod"]?HealthCheckMethodObjectInstance.getByValue(examinationData[i]["healthCheckMethod"], "id")["value"]:""}</span></li>
                                <li><span class="title">录取通知书方式:</span><span name="enrollmentNotificationMethod">${examinationData[i]["enrollmentNotificationMethod"]?EnrollmentNotificationMethodObjectInstance.getByValue(examinationData[i]["enrollmentNotificationMethod"], "id")["value"]:""}</span></li>
                            </ul>
                        </div>
                        <div>
                            <p class="title">体检照片：</p>
                            <ul class="clearfix healthCheckResultPicture" name="healthCheckResultPicture">
                                ${pictureDom}
                            </ul>
                        </div>
                    </li>`
    }

    $(".examinationInfoWrap ").empty().append(liDom)
}
function messageRecord(opt) {
    let msgGrid = null;
    let gridDataSource =getMessageRecordList().mergeQuery(function () {
        return {
            userId: userId,
            schoolId: opt.schoolId,
            collegeId: opt.collegeId
        }
    }).dataSource;
    if (msgGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    msgGrid = new KendoGrid('#grid', {
        columns: [
            {
                field: 'userName',
                title: '姓名',
            },
            {
                field: 'templateName',
                title: '消息模板',
                filterable: false
            },
            {
                field: 'messageNode',
                title: '通知节点',
                filterable: {
                    ui: function (element) {
                        let dataSource = MessageNodeObjectInstance.toObjectArray();
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
                    return MessageNodeObjectInstance.getByValue(dataItem.messageNode, "id")["value"]
                }
            },
            {
                field: 'creationTime',
                title: '创建时间',
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
        ],
        dataSource: gridDataSource,
        detailTemplate: kendo.template($("#subGridTemplate").html()),
        detailExpand: function (e) {
            //表格展开
            let detailRow = e.detailRow,
                uid = $(e.masterRow).attr('data-uid'),
                masterRowData = gridDataSource.getByUid(uid),
                gcontentEl = detailRow.find('div.subContentWrap')
            if (masterRowData.content) {
                $(detailRow).find('div.subContentWrap').html(masterRowData.content)
            } else {
                $(detailRow).find('div.subContentWrap').html("暂无数据")
            }
            

        }

    });
    msgGrid.init()
}
$(function () {
    $("#tabstrip").kendoTabStrip({
        activate: function (e) {
            if ($(e.contentElement).attr("id") === "messageRecord") {
                messageRecord({ schoolId: store.get('schoolId'), collegeId: store.get('collegelId') })
            }
        }
    });
    getUserBaseData();
    getUserOtherData();
    examinationDatRend();
    //$("#sendBtn").off().on("click", function () {
    //    if (!sendMsgWindow) {
    //        sendMsgWindow = new SendMsgWindow("#sendWindow", {
    //            messageNode: MessageNodeObjectInstance.getByValue("other", "key").id,
    //            ifShowMsgType: true,
    //        })
    //        sendMsgWindow.init()
    //    }
    //    sendMsgWindow.open()
    //})
    //如果是从考生管理页面进来的则不显示审核按钮
    if (applyId==="null") {
        $("#auditBtn").hide()
    }
});