import { KendoGrid } from '../../../component/kendo/grid';
import * as logController from '../../../controller/systemSetting/loglist';

let loglistGrid = null;
let gridDataSource = null;

function gridInit() {
    gridDataSource = logController.getLogList().dataSource;
    if (loglistGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    loglistGrid = new KendoGrid('#grid', {
        columns: [
        {
            field: 'logged',
            title: '日志时间',
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
        {
            field: 'level',
            title: '等级'
        },
        {
            field: 'message',
            title: '信息'
        },
        {
            field: 'url',
            title: '链接',
        },
        ],
        dataSource: gridDataSource,
        dataBound: function (e) {
        }

    });
    loglistGrid.init()
}
$(function () {
    gridInit()
})