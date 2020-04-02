import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { auditApplication } from '../../../controller/retestManagement/applicationReview';
import { ApiCollection } from '../../../common/apiCollection';
import { actions } from "./actions";
import { ApplicationStatusObjectInstance } from '../../../objectValue/retestManagement/applicationStatus';

let globalEvent = memoryStore.get('globalEvent');
let auditDto = ApiCollection['post/admin/Application/Audit'].reqDto;
let reviewDropdown = null;
let auditForm = null;
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
        })
    }

}
let auditWindow = new KendoWindow('#auditWindow', {
    title: '审核',
    size:"small",
    open: function () {
        reviewDropdownInit()
        let selectId = memoryStore.get('selectedId')
        //选择发送通知，显示消息模板
        $("#auditIfSendMessage").change(function () {
            let value = $(this).prop("checked")
            console.log(value)
            if (value) {
                console.log($("#auditWindow").find("input[name='templateId']").parent())
                $("#auditWindow").find("input[name='templateId']").parent().show()
            } else {
                $("#auditWindow").find("input[name='templateId']").parent().hide()
            }
        })
        if (!auditForm) {
            auditForm = new Form('#auditWindow', {
                dto: auditDto,
                onSubmit: function () {
                    let t = auditForm.getValue();
                    t.ids = selectId;
                    t.status = parseInt(t.status)
                    auditApplication(t).then((data) => {
                        auditForm.cancelLoading();
                        auditForm.clearForm();
                        auditWindow.close();
                        globalEvent.trigger(actions.refresh);
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
        globalEvent.trigger(actions.refresh);
        auditWindow.open()
    })
})