import { KendoWindow } from '../../../component/kendo/window';
import { editSchool } from '../../../controller/rbac/school';
import { editCollege } from '../../../controller/rbac/college';
import { getMessageCount } from '../../../controller/systemSetting/messageRecord';
import { ApiCollection } from '../../../common/apiCollection'
import { actions } from "./actions";

let globalEvent = memoryStore.get('globalEvent');
let openMsgDto = ApiCollection["post/admin/College/Create"].reqDto;
let type = "school";

function messageCountRend() {
    $('#messageStartTime').kendoDatePicker({
        format: 'yyyy-MM-dd'
    })
    $('#messageEndTime').kendoDatePicker({
        format: 'yyyy-MM-dd'
    })
    $("#searchCountBtn").off().on("click", function () {
        let param = {
            schoolId: memoryStore.get('operatingSchoolId')||null,
            collegeId: memoryStore.get('operatingCollegeId')||null,
            creationTimeStart: $('#messageStartTime').data("kendoDatePicker").value(),
            creationTimeEnd: $('#messageEndTime').data("kendoDatePicker").value()
        }
        getMessageCount(param).then((data) => {
            $("#openSendMsgWindow .sendSmsNumber").text(data.smsCount)
            $("#openSendMsgWindow .sendWxNumber").text(data.wechatCount)
        })
    })
   
}
let openMsgWindow = new KendoWindow('#openSendMsgWindow', {
    title: '开启/关闭短信通知',
    open: function (opt) {
        messageCountRend()
        let selectedData = memoryStore.get('selectedData');
        let ifOpenSms = selectedData['schoolIfOpenSms'] || selectedData['collegeIfOpenSms']
        if (ifOpenSms) {
            $("#editIfOpenSms").prop("checked", true)
        } else {
            $("#editIfOpenSms").prop("checked", false)
        }
        $("#editIfOpenSms").off("change").change(function () {
            let ifSendMsg = $(this).prop("checked")
            let data = {
                id: selectedData["id"],
                ifOpenSms: ifSendMsg
            }
            if (type==="school") {
                editSchool(data).then((data) => {
                    openMsgWindow.close();
                    globalEvent.trigger('refreshSchool');
                }).catch((err) => {
                    openMsgWindow.close();
                })
            }
            if (type === "college") {
                editCollege(data).then((data) => {
                    openMsgWindow.close();
                    globalEvent.trigger('refreshSchool');
                }).catch((err) => {
                    openMsgWindow.close();
                })
            }
        })
    }
});

$(function () {

    globalEvent.on(actions.openSchoolIfSendMessage, function () {
        type = "school"
        openMsgWindow.open();
    })
    globalEvent.on(actions.openCollegeIfSendMessage, function () {
        type = "college"
        openMsgWindow.open();
    })

});
