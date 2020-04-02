import { KendoGrid } from '../../../component/kendo/grid';
import { getMessageRecordList } from '../../../controller/systemSetting/messageRecord';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { SubGrid } from "../../../component/subGrid";
import { MessageNodeObjectInstance } from '../../../objectValue/systemSetting/messageNode';

let eventBus = memoryStore.get('globalEvent');
let msgGrid = null;
let gridDataSource = null;

function gridInit() {
    gridDataSource = getMessageRecordList().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
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
            $(detailRow).find('div.subContentWrap').html(masterRowData.content)

        }

    });
    msgGrid.init()
}
$(function () {
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        memoryStore.set('selectedCollegeId', value);
        gridInit()
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        memoryStore.set('selectedCollegeId', value);
        gridInit()

    })
})