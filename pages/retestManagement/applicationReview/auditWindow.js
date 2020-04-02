import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { auditApplication } from '../../../controller/retestManagement/applicationReview';
import { ApiCollection } from '../../../common/apiCollection';
import { actions } from "./actions";
import { getMessageTemplateSelectList, SendTemplateMessage} from '../../../controller/systemSetting/messageTemplate';
import { MessageTypeObjectInstance } from '../../../objectValue/systemSetting/messageType';
import { ApplicationStatusObjectInstance } from '../../../objectValue/retestManagement/applicationStatus';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';

let globalEvent = memoryStore.get('globalEvent');
let auditDto = ApiCollection['post/admin/Application/Audit'].reqDto;
let reviewDropdown = null;
let auditForm = null;
let templateDataSource = getMessageTemplateSelectList().mergeQuery(function () {
    return {
        type: $("#auditWindow input[name='type']").data("kendoDropDownList").value(),
        schoolId: memoryStore.get('selectedSchoolId'),
        collegeId: memoryStore.get('selectedCollegeId'),
        messageNode: MessageNodeObjectInstance.getByValue("preliminaryResult","key")["id"]
    }
}).dataSource;
let messageTempDropdownList = null;
let messageTypeDropdown = null;

function messageTypeInit() {
    let dataSource = MessageTypeObjectInstance.toObjectArray();
    if (!messageTypeDropdown) {
        messageTypeDropdown = $("#auditWindow input[name='type']").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: dataSource,
            index: 0,
            change: function () {
                let val = this.value();
                templateDataSource.read()
            }
        })
    }

}
function messageTempDropdownInit() {
    if (!messageTempDropdownList) {
        messageTempDropdownList = $("#auditWindow").find('[name="templateId"]').kendoDropDownList({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: templateDataSource,
            index: 0,
        })
    }
}
function reviewDropdownInit() {
    let applicationStatus = ApplicationStatusObjectInstance.toObjectArray();
    let dataSource = [];
    for (let i = 0; i < applicationStatus.length; i++) {
        if (applicationStatus[i]["key"] === "AuditFailed" || applicationStatus[i]["key"] === "AuditPass" || applicationStatus[i]["key"] === "DataUpdate") {
            dataSource.push(applicationStatus[i])
        }
    }
    if (!reviewDropdown) {
        reviewDropdown = $("#auditTypeDropdown").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: dataSource,
        }).data("kendoDropDownList")
    }

}
let auditWindow = new KendoWindow('#auditWindow', {
    title: '审核',
    size:"small",
    open: function () {
        reviewDropdownInit()
        messageTypeInit();
        messageTempDropdownInit()
        let selectId = memoryStore.get('selectedId')
        //选择发送通知，显示消息模板
        $("#auditIfSendMessage").change(function () {
            let value = $(this).prop("checked")
            if (value) {
                $(".tempWrap").show();
                
            } else {
                $(".tempWrap").hide()
            }
        })
        if (!auditForm) {
            auditForm = new Form('#auditWindow', {
                dto: auditDto,
                onSubmit: function () {
                    let selectedId = memoryStore.get('selectedId');
                    let ifSend = $("#auditIfSendMessage").prop("checked")
                    let t = auditForm.getValue();
                    t.ids = selectedId;
                    t.status = parseInt(t.status);
                    auditApplication(t).then((data) => {
                        let sendParam = {}
                        sendParam.schoolId = memoryStore.get('selectedSchoolId');
                        sendParam.collegeId = memoryStore.get('selectedCollegeId')
                        //发送消息
                        if (ifSend) {
                            let type = $("#auditWindow input[name='type']").data("kendoDropDownList").value()
                            if (parseInt(type) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                                sendParam.wxTemplateId = t.templateId
                            }
                            if (parseInt(type) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                                sendParam.msmTemplateId = t.templateId
                            }
                            sendParam.messageNode = MessageNodeObjectInstance.getByValue("preliminaryResult", "key").id;
                            sendParam.messageNodeId = selectedId
                            SendTemplateMessage(sendParam).then((data) => {
                                auditForm.cancelLoading();
                                auditForm.clearForm();
                                auditWindow.close();
                                globalEvent.trigger(actions.refresh);
                            }).catch((error) => {
                                auditForm.cancelLoading();
                            })
                        } else {
                            auditForm.cancelLoading();
                            auditForm.clearForm();
                            auditWindow.close();
                            globalEvent.trigger(actions.refresh);
                        }
                    }).catch((error) => {
                        auditForm.cancelLoading();
                    })
                }
            });
        }
    }
});
$(function () {
    $("#auditBtn").off().on("click", function () {
        auditWindow.open()
    })
})