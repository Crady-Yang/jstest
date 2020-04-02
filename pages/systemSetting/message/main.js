import { KendoGrid } from '../../../component/kendo/grid';
import { getMessageTemplateList, deleteMessageTemplate, editMessageTemplate, enableTemplate, WxModifyTemplates } from '../../../controller/systemSetting/messageTemplate';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ApiCollection } from '../../../common/apiCollection';
import { Form } from "../../../component/form";
import { ConfirmWindow } from "../../../component/confirmWindow";
import { MessageTypeObjectInstance } from '../../../objectValue/systemSetting/messageType';
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
import { ErrorNotification} from '../../../component/notification';
import { createGuid } from '../../../common/utils'
import { actions } from "./actions";
import { databaseKey } from './databaseKey';
import { WxTemp } from './wxTemp'
import './addTemplate'

let eventBus = memoryStore.get('globalEvent');
let editDto = ApiCollection['post/admin/Message/EditTemplate'].reqDto;
let messageTypeDropdown = null;
let tempListDatasource = null;
let messageNodeDropdown = null;
let editForm = null;
let contentEditor = null;
let sheetDatasource = databaseKey.FirstTrialDataBase
let sheetKeyDatasource = databaseKey.FirstTrialKey
let wxTempInstance = new WxTemp({ el: "#app .wxTempWrap", dropDownEl: "#wxTemplateDropdown", callback: editRendWxTemp, messageNodeEl: "#messageNodeDropdown"})
let enableEditor = true;//编辑框光标在{{}}之间不能编辑

function messageTypeInit() {
    let dataSource = MessageTypeObjectInstance.toObjectArray();
    if (!messageTypeDropdown) {
        messageTypeDropdown = $("#typeSelector").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: dataSource,
            optionLabel: "请选择模板类型",
            change: function () {
                tempListDatasource.fetch(function () {
                    let data = tempListDatasource.data();
                    messageTempDomInit(data)

                })
            }
        }).data("kendoDropDownList");
    }
    
}

function messageNodeDropdownInit() {
    let typeDataSource = MessageTypeObjectInstance.toObjectArray();
    let nodeDataSource = MessageNodeObjectInstance.toObjectArray();
    if (!$("#messageTypeDropdown").data("kendoDropDownList")) {
        $("#messageTypeDropdown").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: typeDataSource,
            optionLabel: "请选择模板类型",
            change: function () {
                let val = this.value();
                if (parseInt(val) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                    wxTempInstance.init()
                    $("#app .smsWrap").hide()
                    $("#app .wxWrap").show()
                }
                if (parseInt(val) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                    $("#app .smsWrap").show()
                    $("#app .wxWrap").hide()
                }
            },
        });
    }
    if (!messageNodeDropdown) {
        messageNodeDropdown = $("#messageNodeDropdown").kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: nodeDataSource,
            optionLabel: "请选择通知节点",
            change: function () {
                let val = this.value()
                dataBaseKeyRend(val)
            },
            dataBound: function () {
                let data = tempListDatasource.data();
                let val = data[0].messageNode
                //dataBaseKeyRend(val)
            }
        })
    }
}
function databaseKeyInit(el, opt) {
    let dataBase = opt.key
    let keyItemDom = ``;
    for (let i = 0; i < dataBase.length; i++) {
        keyItemDom += `<li class="pull-left" data-key="${opt.dataBase}_${dataBase[i]}">${dataBase[i]}</li>`
    }
    $(el).find(".keyWrap").empty().append(`<ul class="clearfix">${keyItemDom}<ul/>`)
    $(el).find("li").off().on("click", function () {
        if (!enableEditor) {
            ErrorNotification.show("大括号内不能进行任何操作！", "error")
            return;//如果光标在{{}}则不能插入变量
        }
        let key = $(this).attr("data-key");
        let iframe = $('#templateDetail iframe');
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
function dataBaseKeyRend(val) {
    //初审结果  user表 申请表
    //复试安排 user表 复试安排表 复试分组表
    //复试结果 user 复试结果
    //其他 user
    if (parseInt(val) === MessageNodeObjectInstance.getByValue("preliminaryResult", "key").id) {
        $("#applicationTableKey").show();
        $("#examinationScheduleTableKey").hide();
        $("#examinationGroupTableKey").hide();
        $("#examinationresultTableKey").hide();
        sheetDatasource = databaseKey.FirstTrialDataBase;
        sheetKeyDatasource = databaseKey.FirstTrialKey
    }
    if (parseInt(val) === MessageNodeObjectInstance.getByValue("examinationArrange", "key").id) {
        $("#applicationTableKey").hide();
        $("#examinationScheduleTableKey").show();
        $("#examinationGroupTableKey").show();
        $("#examinationresultTableKey").hide();
        sheetDatasource = databaseKey.ScheduleBase;
        sheetKeyDatasource = databaseKey.ScheduleKey
    }
    if (parseInt(val) === MessageNodeObjectInstance.getByValue("examinationResult", "key").id) {
        $("#examinationresultTableKey").show();
        $("#examinationScheduleTableKey").hide();
        $("#examinationGroupTableKey").hide();
        $("#applicationTableKey").hide();
        sheetDatasource = databaseKey.ResultBase;
        sheetKeyDatasource = databaseKey.ResultKey
    }
    if (parseInt(val) === MessageNodeObjectInstance.getByValue("other", "key").id) {
        $("#examinationresultTableKey").hide();
        $("#examinationScheduleTableKey").hide();
        $("#examinationGroupTableKey").hide();
        $("#applicationTableKey").hide();
        sheetDatasource = databaseKey.OtherBase;
        sheetKeyDatasource = databaseKey.OtherKey
    }
    let item = $("#app .wxTempWrap .keyItem");
    //根据选择的节点改变下拉框中的表和字段
    item.each(function (index, item) {
        let dataBase = $(item).find("input[name='dataBase']").data("kendoDropDownList");
        let key = $(item).find("input[name='key']").data("kendoDropDownList");
        dataBase.setDataSource(sheetDatasource)
        key.setDataSource(sheetKeyDatasource)
    })
}
//图文描述编辑框
function initEditor() {
    if (!contentEditor) {
        contentEditor = $("#templateDetail").find("textarea[name='content']").kendoEditor({
            resizable: {
                content: true,
                resize: true
            },
            tools: [
                //'formatting', 'bold', 'italic', 'underline', 'strikethrough',
                //'fontSize', 'foreColor', 'backColor',
                //'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                //'cleanFormatting', 'viewHtml'
            ],
            select: function (e) {
                //{{}}中间不能操作
                let range = contentEditor.getRange();
                let value = range.endContainer.wholeText;
                let frontValueArr = value ? value.slice(0, range.startOffset) : "";
                let backValueArr = value ? value.slice(range.startOffset, range.startContainer.length) : ""
                let iframe = $('#templateDetail iframe');
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
//根据右边高度计算模板列表高度
function calculateBodyHeight() {
    let rightHeight = $("#templateDetail").height();
    $(".messageWrapLeft").height(rightHeight)
}
//左侧列表渲染
function messageTempDomInit(data) {
    let tempItemDom = ``;
    for (let i = 0; i < data.length; i++) {
        let actionBtnDom = ``;
        let typeDom = ``;
        let msgNode = MessageNodeObjectInstance.getByValue(data[i].messageNode, 'id').value;
        let msgNodeColor = MessageNodeObjectInstance.getByValue(data[i].messageNode, 'id').color;
        if (data[i].enabled) {
            actionBtnDom = `<div class="pull-right operation">
                            <button data-id="${data[i].id}" class="k-button k-icon-button deleteBtn pull-right" data-action="${actions.openDelete}">删除</button>
                            <button data-id="${data[i].id}" class="k-button k-icon-button disableBtn pull-right" data-action="${actions.openDisable}">禁用</button>
                        </div>`;
        } else {
            actionBtnDom = `<div class="pull-right operation">
                            <button  data-id="${data[i].id}" class="k-button k-icon-button enableBtn pull-right" data-action="${actions.openEnable}">启用</button>
                        </div>`;
        }
        if (data[i].type === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
            typeDom = `<span class="templateType wechatType pull-right">微信通知</span>`;
        } else {
            typeDom = `<span class="templateType smsType pull-right">短信通知</span>`;
        }
        tempItemDom += `<li class="messageItemWrap" data-id="${data[i].id}">
                    <div class="messageItem clearfix">
                        <h5 class="pull-left">${data[i].name}</h5>
                        ${typeDom}
                    </div>
                    <div class="messageItem">
                        <span>通知节点：</span><span class="messageNode" style="color:${msgNodeColor}">${msgNode}</span>
                    </div>
                    <div class="messageItem clearfix">
                        <div class="pull-left creatime">
                           ${data[i].creationTime}
                        </div>
                        ${actionBtnDom}
                    </div>
                </li>`;
    }
    
    if (data.length) {
        $(".messageWrapper .noData").hide()
        $(".messageWrapLeft ul").empty().append(tempItemDom)
        $("#templateDetail").show();
    } else {
        $(".messageWrapper .noData").show();
        $(".messageWrapLeft ul").empty();
        $("#templateDetail").hide();
    }
    //绑定操作按钮事件
    $(".messageItemWrap button").off().on("click", function (e) {
        let action = $(this).attr("data-action");
        let id = $(this).attr("data-id");
        let data = tempListDatasource.get(id);
        memoryStore.set('selectedId', id);
        memoryStore.set('selectedData', data);
        if (action) {
            eventBus.trigger(action);
        }
        e.stopPropagation();
    })
    //绑定点击消息模板事件
    $(".messageWrapper .messageItemWrap").off().on("click", function (e) {
        let nodeClass = $(this).attr("class").indexOf("noData");
        if (nodeClass > -1) {
            return
        }
        let id = $(this).attr("data-id");
        let data = tempListDatasource.get(id);
        memoryStore.set('selectedId', id);
        memoryStore.set('selectedData', data);
        $("#templateDetail").show();
        $(".messageWrapRight .noData").hide()
        $(this).addClass("messageItemWrapSelected").siblings().removeClass("messageItemWrapSelected")
        messageRightDetailInit();
        //dataBaseKeyRend(data.messageNode)
    })
    //默认选中第一条模板
    $(".messageWrapper .messageItemWrap").eq(1).trigger("click")
}
//右侧表单渲染
function messageRightDetailInit() {
    let selectedData = memoryStore.get('selectedData')
    console.log(selectedData)
    initEditor();
    messageNodeDropdownInit();
    databaseKeyInit("#userTableKey", { dataBase: "user", key: databaseKey["user"] })
    databaseKeyInit("#applicationTableKey", { dataBase: "application", key: databaseKey["application"] })
    databaseKeyInit("#examinationScheduleTableKey", { dataBase: "examinationschedule", key: databaseKey["examinationschedule"] })
    databaseKeyInit("#examinationGroupTableKey", { dataBase: "examinationgroup", key: databaseKey["examinationgroup"] })
    databaseKeyInit("#examinationresultTableKey", { dataBase: "examinationresult", key: databaseKey["examinationresult"] })
    if (!editForm) {
        editForm = new Form('#templateDetail', {
            dto: editDto,
            onSubmit: function () {
                let selected = memoryStore.get('selectedData')
                let filterHtmlregex = /<\/?.+?\/?>/g;//去掉所有标签
                let t = editForm.getValue();
                let content = t.content
                t.id = selected.id;
                let msgType = $("#messageTypeDropdown").data("kendoDropDownList").value();
                ////编辑模板接口如果name不修改则传null或不传
                //if (t.name === oldName) {
                //    t.name=null
                //}
                //模板要去掉所有的标签
                t.content = content.replace(filterHtmlregex, '')
                //微信模板
                if (parseInt(msgType) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                    t.contentSummary = wxTempInstance.getTempValue()
                    editMessageTemplate(t).then((data) => {
                        editForm.cancelLoading();
                        eventBus.trigger(actions.refresh);
                    }).catch((error) => {
                        editForm.cancelLoading();
                    })
                }
                //短信模板,contentSummary字段映射直接就是数据库字段对应数据库字段
                if (parseInt(msgType) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                    let regex = /{{(.*?)}}/g;//取出{{}}中间的变量
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
                    WxModifyTemplates({ temp_Id: selected.wxTemplateId, template: t.content, remark: t.remark,type:2 }).then((data) => {
                        editMessageTemplate(t).then((data) => {
                            editForm.cancelLoading();
                            eventBus.trigger(actions.refresh);
                        }).catch((error) => {
                            editForm.cancelLoading();
                        })
                    }).catch((error) => {
                        editForm.cancelLoading();
                    })
                }
            }
        });
    }
    editForm.setValue(selectedData);
    let msgType = $("#messageTypeDropdown").data("kendoDropDownList").value();
    if (parseInt(msgType) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
        $("#app .smsWrap").hide()
        $("#app .wxWrap").show()
        wxTempInstance.init()
    }
    if (parseInt(msgType) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
        $("#app .smsWrap").show()
        $("#app .wxWrap").hide()
    }
    calculateBodyHeight()
}
//编辑情况下根据回来的字段映射渲染
function editRendWxTemp() {
    let selectedData = memoryStore.get('selectedData');
    let wxData = $("#wxTemplateDropdown").data("kendoDropDownList").dataSource.data();
    let msgNode = $("#messageNodeDropdown").data("kendoDropDownList").value();
    wxData.map((v) => {
        if (selectedData.wxTemplateId === v.id) {
            let contentObj = v.contentObj;
            let contentSummary = JSON.parse(selectedData.contentSummary)
            for (let key in contentSummary) {
                for (let i = 0; i < contentObj.length; i++) {
                    if (key === contentObj[i]["key"]) {
                        let t = contentSummary[key].match(/{{(\S*)}}/)[1].split("_")
                        contentObj[i]["dataBaseValue"] = t[0];
                        contentObj[i]["keyValue"] = t[1]
                    }
                }
            }
            dataBaseKeyRend(msgNode)
            wxTempInstance.wxTempWrapRend(v.contentObj, { sheetDatasource: sheetDatasource, sheetKeyDatasource: sheetKeyDatasource})
            
        }
        return v
    })
    calculateBodyHeight()
}
$(function () {
    messageTypeInit();
    tempListDatasource = getMessageTemplateList().mergeQuery(function () {
        return {
            // schoolId: memoryStore.get('selectedSchoolId'),
            // collegeId: memoryStore.get('selectedCollegeId'),
            type: $("#typeSelector").data("kendoDropDownList").value(),
            page:1,
            pageSize:100000
        }
    }).dataSource;
    tempListDatasource.fetch(function () {
        let data = tempListDatasource.data();
        console.log(data)
        messageTempDomInit(data)

    })
    // eventBus.on(GlobalEventName.SelectCollege, function (value) {
    //     memoryStore.set('selectedCollegeId', value);
    //     tempListDatasource = getMessageTemplateList().mergeQuery(function () {
    //         return {
    //             // schoolId: memoryStore.get('selectedSchoolId'),
    //             // collegeId: memoryStore.get('selectedCollegeId'),
    //             type: $("#typeSelector").data("kendoDropDownList").value()
    //         }
    //     }).dataSource;
    //     tempListDatasource.fetch(function () {
    //         let data = tempListDatasource.data();
    //         messageTempDomInit(data)
    //
    //     })
    // })
    // eventBus.on(GlobalEventName.CollegeChange, function (value) {
    //     memoryStore.set('selectedCollegeId', value);
    //     tempListDatasource = getMessageTemplateList().mergeQuery(function () {
    //         return {
    //             // schoolId: memoryStore.get('selectedSchoolId'),
    //             // collegeId: memoryStore.get('selectedCollegeId'),
    //             type: $("#typeSelector").data("kendoDropDownList").value()
    //         }
    //     }).dataSource;
    //     tempListDatasource.fetch(function () {
    //         let data = tempListDatasource.data();
    //         messageTempDomInit(data)
    //     })
    // })
    //
    eventBus.on(actions.refresh, function () {
        tempListDatasource.fetch(function () {
            let data = tempListDatasource.data();
            messageTempDomInit(data)
        })
    });
    let deleteConfirmWindow = new ConfirmWindow('#deleteWindow', {
        type: 'delete',
        onSubmit: deleteMessageTemplate,
        onSuccess: function () {
            eventBus.trigger('refresh')
        }
    });
    let enableConfirmWindow = new ConfirmWindow('#enableWindow', {
        type: 'enable',
        onSubmit: enableTemplate,
        onSuccess: function () {
            eventBus.trigger('refresh')
        }
    });
    let disableConfirmWindow = new ConfirmWindow('#disableWindow', {
        type: 'disable',
        onSubmit: enableTemplate,
        onSuccess: function () {
            eventBus.trigger('refresh')
        }
    });
    eventBus.on(actions.openDelete, function () {
        deleteConfirmWindow.open(memoryStore.get('selectedData'))
    });

    eventBus.on(actions.openEnable, function () {
        console.log(memoryStore.get('selectedData'))
        enableConfirmWindow.open(memoryStore.get('selectedData'))
    });

    eventBus.on(actions.openDisable, function () {
        disableConfirmWindow.open(memoryStore.get('selectedData'))
    });
})