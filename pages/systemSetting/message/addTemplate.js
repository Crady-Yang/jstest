import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { addMessageTemplate, WxAddTemplates } from '../../../controller/systemSetting/messageTemplate';
import { ApiCollection } from '../../../common/apiCollection';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
import { MessageTypeObjectInstance } from '../../../objectValue/systemSetting/messageType';
import { createGuid } from '../../../common/utils';
import { ErrorNotification } from '../../../component/notification';
import { databaseKey } from './databaseKey';
import { actions } from "./actions";
import { WxTemp } from './wxTemp'
import { deepMerge } from '../../../common/deepMerge'

let globalEvent = memoryStore.get('globalEvent');
let addTempDto = ApiCollection['post/admin/Message/CreateTemplate'].reqDto;
let messageNodeDropdown = null;
let addForm = null;
let messageTypeDropdown = null;
let contentEditor = null;
let wxTempInstance = new WxTemp({ el: "#addWindow .wxTempWrap", dropDownEl: "#addWindow input[name='wxTemplateId']", messageNodeEl:"#addMessageNodeDropdown"})
let sheetDatasource = databaseKey.FirstTrialDataBase;
let sheetKeyDatasource = databaseKey.FirstTrialKey;
let enableEditor = true;//编辑框光标在{{}}之间不能编辑
function messageTypeInit() {
    let dataSource = MessageTypeObjectInstance.toObjectArray();
    console.log($("#addMessageTypeDropdown"))
    if (!messageTypeDropdown) {
        messageTypeDropdown = $("#addMessageTypeDropdown").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: dataSource,
            change: function () {
                let val = this.value();
                if (parseInt(val) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                    addTempDto.remark.required = false
                    addForm.changeDto({ dto: addTempDto })
                    wxTempInstance.init()
                    $("#addWindow .wxWrap").show();
                    $("#addWindow .smsWrap").hide()
                    $('#addWindow').find('[for="wxTemplateId"]').addClass("required")
                    $('#addWindow').find('[name="wxTemplateId"]').attr("required", "required")
                }
                if (parseInt(val) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                    addTempDto.remark.required = true
                    addForm.changeDto({ dto: addTempDto})
                    $("#addWindow .wxWrap").hide();
                    $("#addWindow .smsWrap").show();
                    $('#addWindow').find('[for="wxTemplateId"]').removeClass("required")
                    $('#addWindow').find('[name="wxTemplateId"]').removeAttr("required", "required")
                }
            }
        })
    }

}
//通知节点
function messageNodeDropdownInit() {
    let dataSource = MessageNodeObjectInstance.toObjectArray();
    if (!messageNodeDropdown) {
        messageNodeDropdown = $("#addMessageNodeDropdown").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: dataSource,
            change: function () {
                let val = this.value()
                //初审结果  user表 申请表
                //复试安排 user表 复试安排表 复试分组表
                //复试结果 user 复试结果
                //其他 user
                //初审结果节点
                if (parseInt(val) === MessageNodeObjectInstance.getByValue("preliminaryResult", "key").id) {
                    $("#addApplicationTableKey").show();
                    $("#addExaminationScheduleTableKey").hide();
                    $("#addExaminationGroupTableKey").hide();
                    $("#addExaminationresultTableKey").hide();
                    sheetDatasource = databaseKey.FirstTrialDataBase;
                    sheetKeyDatasource = databaseKey.FirstTrialKey
                }
                //复试安排节点
                if (parseInt(val) === MessageNodeObjectInstance.getByValue("examinationArrange", "key").id) {
                    $("#addApplicationTableKey").hide();
                    $("#addExaminationScheduleTableKey").show();
                    $("#addExaminationGroupTableKey").show();
                    $("#addExaminationresultTableKey").hide();
                    sheetDatasource = databaseKey.ScheduleBase;
                    sheetKeyDatasource = databaseKey.ScheduleKey
                }
                //初审结果节点
                if (parseInt(val) === MessageNodeObjectInstance.getByValue("examinationResult", "key").id) {
                    $("#addExaminationresultTableKey").show();
                    $("#addExaminationScheduleTableKey").hide();
                    $("#addExaminationGroupTableKey").hide();
                    $("#addApplicationTableKey").hide();
                    sheetDatasource = databaseKey.ResultBase;
                    sheetKeyDatasource = databaseKey.ResultKey
                }
                //其他
                if (parseInt(val) === MessageNodeObjectInstance.getByValue("other", "key").id) {
                    $("#addExaminationresultTableKey").hide();
                    $("#addExaminationScheduleTableKey").hide();
                    $("#addExaminationGroupTableKey").hide();
                    $("#addApplicationTableKey").hide();
                    sheetDatasource = databaseKey.OtherBase;
                    sheetKeyDatasource = databaseKey.OtherKey
                }
                let item = $("#addWindow .keyItem");
                //根据选择的节点改变下拉框中的表和字段
                if (item.length > 0) {
                    wxTempInstance.getWxTempData()
                }
                //item.each(function (index, item) {
                //    let dataBase = $(item).find("input[name='dataBase']").data("kendoDropDownList");
                //    let key = $(item).find("input[name='key']").data("kendoDropDownList");
                //    dataBase.setDataSource(sheetDatasource)
                //    key.setDataSource(sheetKeyDatasource)
                //})
            }
        })
    }
}
//生成表字段结构
function databaseKeyInit(el, opt) {
    let data = opt.key
    let keyItemDom = ``;
    for (let i = 0; i < data.length; i++) {
        keyItemDom += `<li class="pull-left" data-key="${opt.dataBase}_${data[i]}">${data[i]}</li>`
    }
    $(el).find(".keyWrap").empty().append(`<ul class="clearfix">${keyItemDom}<ul/>`)
    $(el).find("li").off().on("click", function () {
        if (!enableEditor) {
            ErrorNotification.show("大括号内不能进行任何操作！", "error")
            return;//如果光标在{{}}则不能插入变量
        }
        contentEditor.focus()
        let key = $(this).attr("data-key");
        let iframe = $('#addWindow iframe');
        let view = iframe[0].contentDocument || iframe[0].contentWindow.document;
        let sel, range;
        if (view.getSelection) {
            sel = view.getSelection();
            console.log(sel)
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                sel.removeAllRanges(); // 删除Selection中的所有Range 
                range.deleteContents(); // 清除Range中的内容 
                // 获得Range中的第一个html结点 
                var container = range.startContainer;
                // 获得Range起点的位移 
                var pos = range.startOffset;
                // 建一个空Range 
                range = document.createRange(); 
                // 插入内容 
                var cons = document.createTextNode(`{{${key}}}`); 
                container.insertData(pos, cons.nodeValue); 
                // 改变光标位置 
                range.setEnd(container, pos + cons.nodeValue.length);
                range.setStart(container, pos + cons.nodeValue.length); 
                
            }
        } else if (document.selection && document.selection.type != "Control") {
            document.selection.createRange().pasteHTML(str);
        } 
    })
    
}
//消息编辑框
function initEditor() {
    if (!contentEditor) {
        contentEditor= $("#addWindow").find("textarea[name='content']").kendoEditor({
            resizable: {
                content: true,
                resize: true
            },
            tools: [
                //'formatting', 'bold', 'italic', 'underline', 'strikethrough',
                //'fontSize', 'foreColor', 'backColor',
                //'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                //'createLink', 'unlink',
                //'cleanFormatting', 'viewHtml'
            ],
            select: function (e) {
                //{{}}中间不能操作
                let range = contentEditor.getRange();
                let value = range.endContainer.wholeText;
                let frontValueArr = value ? value.slice(1, range.startOffset): "";
                let backValueArr = value ? value.slice(range.startOffset, range.startContainer.length): ""
                let iframe = $('#addWindow iframe');
                if (frontValueArr.lastIndexOf("{{") > -1 && backValueArr.indexOf("}}") > -1) {
                    enableEditor = false;
                }
                if (frontValueArr.lastIndexOf("}}") > -1 && frontValueArr.lastIndexOf("}}") > frontValueArr.lastIndexOf("{{") && backValueArr.indexOf("{{") > -1 && backValueArr.indexOf("{{") < backValueArr.indexOf("}}")) {
                    enableEditor = true;
                }
                if (frontValueArr.lastIndexOf("{{") === -1 || backValueArr.indexOf("}}") === -1) {
                    enableEditor = true;
                }
                //}}两个结尾括号之间
                if (backValueArr.indexOf("}") === 0) {
                    enableEditor = false;
                }
                //{{两个起始括号之间
                if (frontValueArr.lastIndexOf("{") > -1 && frontValueArr.lastIndexOf("{") === frontValueArr.length - 1) {
                    enableEditor = false;
                }
                if (!enableEditor) {
                    $(iframe[0].contentDocument.body).attr("contenteditable", "false")
                    ErrorNotification.show("大括号内不能进行任何操作！", "error")
                } else {
                    $(iframe[0].contentDocument.body).attr("contenteditable", "true")
                    contentEditor.focus()
                }
            },
        }).data("kendoEditor");
    }
    
}
let addWindow = new KendoWindow('#addWindow', {
    title: '添加消息模板',
    open: function () {
        initEditor()
        messageTypeInit()
        messageNodeDropdownInit()
        wxTempInstance.init()
        databaseKeyInit("#addUserTableKey", { dataBase: "user", key: databaseKey["user"]} )
        databaseKeyInit("#addApplicationTableKey", { dataBase: "application", key: databaseKey["application"] } )
        databaseKeyInit("#addExaminationScheduleTableKey", { dataBase: "examinationschedule", key: databaseKey["examinationschedule"] })
        databaseKeyInit("#addExaminationGroupTableKey", {dataBase: "examinationgroup", key: databaseKey["examinationgroup"] })
        databaseKeyInit("#addExaminationresultTableKey", { dataBase: "examinationresult", key: databaseKey["examinationresult"] })
        $("#addApplicationTableKey").show();//默认显示user表和申请表
        if (!addForm) {
            addForm = new Form('#addWindow', {
                dto: addTempDto,
                onSubmit: function () {
                    let t = addForm.getValue();
                    let filterHtmlregex = /<\/?.+?\/?>/g;//去掉所有标签
                    // t.schoolId = memoryStore.get('selectedSchoolId');
                    // t.collegeId = memoryStore.get('selectedCollegeId');
                    let content = t.content
                    //模板要去掉所有的标签
                    t.content = content.replace(filterHtmlregex, '')
                    let msgType = $("#addMessageTypeDropdown").data("kendoDropDownList").value();
                    //微信模板
                    if (parseInt(msgType) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                        t.contentSummary = wxTempInstance.getTempValue()
                        addMessageTemplate(t).then((data) => {
                            addForm.cancelLoading();
                            addForm.clearForm();
                            wxTempInstance.wxTempWrapClear()
                            addWindow.close();
                            globalEvent.trigger(actions.refresh);
                        }).catch((error) => {
                            addForm.cancelLoading();
                        })
                    }

                    //短信模板,contentSummary字段映射直接就是数据库字段对应数据库字段
                    if (parseInt(msgType) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                        let regex = /{{(.*?)}}/g;
                        let result;
                        let arr = [];
                        let summary = {};
                        while (result = regex.exec(t.content)) {
                            arr.push(result[1])
                        }
                        for (let i = 0; i < arr.length; i++) {
                            let key = arr[i].split("_")[0]
                            let val = arr[i].split("_")[1]
                            summary[`${key}_${val}`] = `${key}_${val}`
                        }
                        t.contentSummary = JSON.stringify(summary)
                        //先调极光的编辑短信模板接口再调我们自己的编辑接口
                        WxAddTemplates({ template: t.content, type: 2, remark: t.remark }).then((data) => {
                            t.wxTemplateId = data
                            addMessageTemplate(t).then((data) => {
                                addForm.cancelLoading();
                                addForm.clearForm();
                                addWindow.close();
                                globalEvent.trigger(actions.refresh);
                            }).catch((error) => {
                                addForm.cancelLoading();
                            })
                        }).catch((error) => {
                            addForm.cancelLoading();
                        })
                    }
                    
                }
            });
        }
    }
});
$(function () {
    $("#addBtn").off().on("click", function () {
        addWindow.open()
    })
})