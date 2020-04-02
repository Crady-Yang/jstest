import { BaseComponent } from "./baseComponent";
import { getMessageTemplateSelectList, SendTemplateMessage, SendMessage } from '../controller/systemSetting/messageTemplate';
import { MessageNodeObjectInstance } from '../objectValue/systemSetting/messageNode';
import { MessageTypeObjectInstance } from '../objectValue/systemSetting/messageType';
import { ApiCollection } from '../common/apiCollection';
import { KendoWindow } from '../component/kendo/window';
import { Form } from "../component/form";
let eventBus = memoryStore.get('GlobalEvent');
let sendDto = ApiCollection['post/admin/Message/SendTemplateMessage']

export class SendMsgWindow extends BaseComponent {
    constructor(el, opt) {
        opt = opt || {};
        super(el, opt);
        this.windowEl = el || null;
        this.messageNode = opt.messageNode;
        this.ifShowMsgType = opt.ifShowMsgType || false
        this.sendCallback = opt.sendCallback || function () {}
        this.templateDataSource = null;
        this.msgTypeDropdown = null;
        this.messageTypeDropdown = null;
        this.msgTempDropdown = null;
        this.contentEditor = null;
        this.sendMsgWindow = null;
        this.sendMsgWindowInstance = null;
        this.sendForm = null;
    }

    initDom() {
        let msgTypeDom = "";
        let editorDom = ""
        if (this.ifShowMsgType) {
            msgTypeDom = ` <div class="form-item">
                    <label for="type">消息类型</label>
                    <input type="text" name="type" id="msgTypeDropdown" />
                </div>`
            editorDom = ` <div class="form-item msgContentWrap hidden">
                    <label for="content">消息内容</label>
                    <textarea type="text" name="content"></textarea>
                </div>`
        }
        let formDom = `<div class="lw-form">
                ${msgTypeDom}
                <div class="templateWrap">
                    <div class="form-item">
                        <label for="status">模板类型</label>
                        <input type="text" name="tempType" />
                    </div>
                    <div class="form-item ">
                        <label for="templateId">消息模板</label>
                        <input type="text" name="templateId" id="templateDropdown" />
                    </div>
                </div>
                ${editorDom}
                <div class="clearfix">
                    <button data-submit="true" class="k-button k-primary pull-right">发送</button>
                </div>
            </div>`
        this.$el.empty().append(formDom);
    }
     //消息类型
    msgTypeInit() {
        let that = this;
        let msgTypeDataSource = [
            {
                id: 1,
                value: "模板消息"
            },
            {
                id: 0,
                value: "临时消息"
            }
        ];
        if (!that.msgTypeDropdown) {
            that.msgTypeDropdown = that.$el.find("input[name='type']").kendoDropDownList({
                dataTextField: "value",
                dataValueField: "id",
                dataSource: msgTypeDataSource,
                change: function () {
                    let value = this.value();
                    if (parseInt(value)) {
                        that.$el.find(".messageNodeWrap").show();
                        that.$el.find(".templateWrap").show();
                        that.$el.find(".msgContentWrap").hide();
                    } else {
                        that.$el.find(".messageNodeWrap").hide();
                        that.$el.find(".templateWrap").hide();
                        that.$el.find(".msgContentWrap").show();
                    }
                }
            }).data("kendoDropDownList")
        }
    }
    //模板类型
    tempTypeInit() {
        let that = this;
        let tempTypeDataSource = MessageTypeObjectInstance.toObjectArray();
        if (!that.messageTypeDropdown) {
            that.messageTypeDropdown = that.$el.find("input[name='tempType']").kendoDropDownList({
                dataTextField: "value",
                dataValueField: "id",
                dataSource: tempTypeDataSource,
                index: 0,
                change: function () {
                    that.templateDataSource.read()
                }
            }).data("kendoDropDownList")
        }
    }
    //消息模板
    msgTempInit() {
        let that = this;
        if (!that.msgTempDropdown) {
            that.msgTempDropdown = that.$el.find("input[name='templateId']").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: that.templateDataSource,
            }).data("kendoDropDownList")
        } else {
            that.templateDataSource.read()
        }
    }
    //临时消息
    editorRend() {
        let that = this;
        if (!that.contentEditor) {
            that.contentEditor = that.$el.find("textarea[name='content']").kendoEditor({
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
                ]
            }).data("kendoEditor");
        }
    }
    sendWindowRend() {
        let that = this;
        if (!that.sendMsgWindowInstance) {
            that.initDom()
            that.tempTypeInit();
            if (that.ifShowMsgType) {
                that.msgTypeInit();
                that.editorRend();
            }
            that.templateDataSource = getMessageTemplateSelectList().mergeQuery(function () {
                return {
                    //schoolId: memoryStore.get('selectedSchoolId'),
                    //collegeId: memoryStore.get('selectedCollegeId'),
                    type: that.messageTypeDropdown.value(),
                    messageNode: that.messageNode
                }
            }).dataSource || opt.dataSource;
            that.msgTempInit();
            that.sendMsgWindow = new KendoWindow(that.windowEl, {
                dto: sendDto,
                title: that.title ||"发送消息",
                open: function () {
                    if (!that.sendForm) {
                        that.sendForm = new Form(that.windowEl, {
                            onSubmit: function () {
                                let data = memoryStore.get('selectedData');
                                let t = that.sendForm.getValue();
                                let type = that.messageTypeDropdown.value()
                                let param = {};
                                let content = t.content
                                let filterHtmlregex = /<\/?.+?\/?>/g;//去掉所有标签
                                let ids = data.map((v) => {
                                    return v.id
                                })
                                param.schoolId = memoryStore.get('selectedSchoolId');
                                param.collegeId = memoryStore.get('selectedCollegeId')
                                if (that.ifShowMsgType) {
                                    let msgType = that.msgTypeDropdown.value();
                                    //模板消息
                                    if (msgType === "1") {
                                        if (parseInt(type) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                                            param.wxTemplateId = t.templateId
                                        }
                                        if (parseInt(type) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                                            param.msmTemplateId = t.templateId
                                        }
                                        param.messageNode = that.messageNode;
                                        param.messageNodeId = ids;
                                        
                                        SendTemplateMessage(param).then((data) => {
                                            that.sendForm.cancelLoading();
                                            that.sendMsgWindow.close();
                                            that.sendCallback()
                                        }).catch((error) => {
                                            that.sendForm.cancelLoading();
                                        })
                                    } else {
                                        //临时消息
                                        param.userId = ids;
                                        param.content = content.replace(filterHtmlregex, '');
                                        SendMessage(param).then((data) => {
                                            that.sendForm.cancelLoading();
                                            that.sendMsgWindow.close();
                                            that.sendCallback()
                                        }).catch((error) => {
                                            that.sendForm.cancelLoading();
                                        })
                                    }
                                } else {
                                    if (parseInt(type) === MessageTypeObjectInstance.getByValue("wechat", "key").id) {
                                        param.wxTemplateId = t.templateId
                                    }
                                    if (parseInt(type) === MessageTypeObjectInstance.getByValue("sms", "key").id) {
                                        param.msmTemplateId = t.templateId
                                    }
                                    param.messageNode = that.messageNode;
                                    param.messageNodeId = ids
                                    SendTemplateMessage(param).then((data) => {
                                        that.sendForm.cancelLoading();
                                        that.sendMsgWindow.close();
                                        that.sendCallback()
                                    }).catch((error) => {
                                        that.sendForm.cancelLoading();
                                    })
                                }
                                
                            }
                        });
                    }
                }
            });
            that.sendMsgWindowInstance = that.$el.data("kendoWindow")
        }
    }
    open() {
        console.log(this.sendMsgWindow)
        this.sendMsgWindow.open();
    }

    close() {
        this.sendMsgWindow.close();
    }

    init() {
        let that = this;
        that.sendWindowRend()
    }

}