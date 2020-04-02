import { BaseComponent } from '../../../component/baseComponent';
import { wxGetTemplateList } from '../../../controller/systemSetting/messageTemplate';
import { databaseKey } from './databaseKey';
import { createGuid } from '../../../common/utils'
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';
export class WxTemp extends BaseComponent {
    constructor(opt) {
        super(opt);
        this.el = opt.el;
        this.dropDownEl = opt.dropDownEl;
        this.messageNodeEl = opt.messageNodeEl;
        this.callback = opt.callback || function () { }
    }
    databaseAndKeyDatasource() {
        this.messageNode = $(this.messageNodeEl).val()
        if (this.messageNode === "") {
            this.sheetDatasource = databaseKey.FirstTrialDataBase;
            this.sheetKeyDatasource = databaseKey.FirstTrialKey;
        }
        //初审结果节点
        if (parseInt(this.messageNode) === MessageNodeObjectInstance.getByValue("preliminaryResult", "key").id) {
            this.sheetDatasource = databaseKey.FirstTrialDataBase;
            this.sheetKeyDatasource = databaseKey.FirstTrialKey
        }
        //复试安排节点
        if (parseInt(this.messageNode) === MessageNodeObjectInstance.getByValue("examinationArrange", "key").id) {
            this.sheetDatasource = databaseKey.ScheduleBase;
            this.sheetKeyDatasource = databaseKey.ScheduleKey
        }
        //初审结果节点
        if (parseInt(this.messageNode) === MessageNodeObjectInstance.getByValue("examinationResult", "key").id) {
            this.sheetDatasource = databaseKey.ResultBase;
            this.sheetKeyDatasource = databaseKey.ResultKey
        }
        //其他
        if (parseInt(this.messageNode) === MessageNodeObjectInstance.getByValue("other", "key").id) {
            this.sheetDatasource = databaseKey.OtherBase;
            this.sheetKeyDatasource = databaseKey.OtherKey
        }
    }
    getWxTempData() {
        let that = this;
        let dataSource = wxGetTemplateList().dataSource
        $(that.dropDownEl).kendoDropDownList({
            dataTextField: "title",
            dataValueField: "priTmplId",
            dataSource: dataSource,
            optionLabel: "请选择微信模板",
            change: function (e) {
                let val = this.value()
                let data = e.sender.dataSource.get(val)
                console.log(data)
                that.databaseAndKeyDatasource()
                that.wxTempWrapRend(data.contentObj)
            },
            dataBound: function (e) {
                let data = dataSource.data()
                data.map((v) => {
                    let arr = v.content.split(/[\s\n]/)//字符串根据\n拆分成数组
                    arr.pop()
                    v.contentObj = [];
                    for (let i = 0; i < arr.length; i++) {
                        let obj = {};
                        obj.dataBaseValue = "";
                        obj.keyValue = "";
                        obj.name = arr[i].split(":")[0];
                        obj.key = arr[i].split(":")[1].match(/{{(\S*)}}/)[1].split(".")[0];//先拿出{{}}中间的字符串再根据.拆分拿到变量
                        v.contentObj.push(obj)
                        v.id = v.priTmplId
                    }
                    return v
                })
                console.log(data)
                let val = this.value()
                let tempdata = e.sender.dataSource.get(val)
                if (val) {
                    that.databaseAndKeyDatasource()
                    that.wxTempWrapRend(tempdata.contentObj)
                }
                that.callback()
            }
        })
    }
    //微信模板映射渲染
    wxTempWrapRend(data, opt) {
        let that = this;
        let liDom = ``
        for (let i = 0; i < data.length; i++) {
            let uid = createGuid();
            liDom += `<li class="keyItem row" data-id="${uid}" style="margin-bottom: 8px;" data-key="${data[i]["key"]}">
                        <span class="col-lg-2" style="line-height: 30px;background: var(--tea-l);text-align: center;color: #fff;" >${data[i]["name"]}</span>
                        <input name="dataBase" class="col-lg-3" id="${uid}-dataBase"/>
                        <input name="key"  class="col-lg-3" id="${uid}-key"/>
                    </li>`
        }
        $(that.el).show().empty().append(`<ul>${liDom}</ul>`);
        for (let j = 0; j < data.length; j++) {
            let itemUid = $(that.el).find(".keyItem").eq(j).attr("data-id")
            $(`#${itemUid}-dataBase`).kendoDropDownList({
                dataTextField: "name",
                dataValueField: "name",
                dataSource:opt? opt.sheetDatasource : that.sheetDatasource
            }).data("kendoDropDownList");
            $(`#${itemUid}-key`).kendoDropDownList({
                cascadeFrom: `${itemUid}-dataBase`,
                cascadeFromField: "parentId",
                cascadeFromParentField: "cascadeId",
                dataTextField: "name",
                dataValueField: "name",
                dataSource:opt? opt.sheetKeyDatasource: that.sheetKeyDatasource
            });
            if (data[j]["dataBaseValue"]) {
                $(`#${itemUid}-dataBase`).data("kendoDropDownList").value(data[j]["dataBaseValue"])
            }
            if (data[j]["keyValue"]) {
                $(`#${itemUid}-key`).data("kendoDropDownList").value(data[j]["keyValue"])
            }
        }
    }
    wxTempWrapClear() {
        let that = this;
        $(that.el).empty().hide()
    }
    getTempValue() {
        let that=this
        let item = $(that.el).find(".keyItem");
        let contentSummary = {}
        item.each(function (index, item) {
            let name = $(item).attr("data-key");
            let dataBase = $(item).find("input[name='dataBase']").val();
            let key = $(item).find("input[name='key']").val();
            contentSummary[name] = `{{${dataBase}_${key}}}`;
        })
        return JSON.stringify(contentSummary)
    }
    init() {
        
        this.getWxTempData();
    }
}