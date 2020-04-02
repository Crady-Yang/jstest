import { KendoWindow } from '../../../component/kendo/window';
import { KendoGrid } from '../../../component/kendo/grid';
import { getNotStartScheduleList, moveToOtherSchedule } from '../../../controller/retestManagement/examinationSchedule';
import { actions } from "./actions";

let globalEvent = memoryStore.get('globalEvent');

let scheduleGrid = null;
let scheduleGridDataSource = null


let moveToWindow = new KendoWindow('#moveToWindow', {
    title: '移动到',
    open: function () {
        let selectedData = memoryStore.get('selectedData');
        console.log(selectedData)
        scheduleGridDataSource = getNotStartScheduleList().mergeQuery(function () {
            return {
                schoolId: memoryStore.get('selectedSchoolId'),
                collegeId: memoryStore.get('selectedCollegeId'),
                type: selectedData[0]["scheduleType"]
            }
        }).dataSource;
        if (scheduleGrid) {
            $('#moveTogrid').data('kendoGrid').destroy();
            $('#moveTogrid').empty();
        };
        scheduleGrid = new KendoGrid('#moveTogrid', {
            columns: [
            {
                field: 'scheduleName',
                title: '分组名',
                width:150
            },
            {
                field: 'startTime',
                title: '开始时间',
                width: 150,
                template: function (dataItem) {
                    return moment(dataItem.startTime).format('YYYY-MM-DD HH:mm:ss')
                },
                filterable: {
                    extra: true,
                    ui: "datetimepicker",
                    messages: {
                        info: "enter start point and end point"
                    },
                    operators: {
                        date: {
                            gt: "After",
                            lt: "Before"
                        }
                    },
                }
            },
            {
                field: 'endTime',
                title: '结束时间',
                width: 150,
                template: function (dataItem) {
                    return moment(dataItem.endTime).format('YYYY-MM-DD HH:mm:ss')
                },
                filterable: {
                    extra: true,
                    ui: "datetimepicker",
                    messages: {
                        info: "enter start point and end point"
                    },
                    operators: {
                        date: {
                            gt: "After",
                            lt: "Before"
                        }
                    },
                }
            },
            {
                field: 'groupCount',
                title: '人数',
                width: 100
            },
            {
                field: 'scheduleAddress',
                title: '地点',
                width: 150
            },
            ],
            selectable:true,
            dataSource: scheduleGridDataSource,
            height:300,
            change: function () {

            },
            dataBound: function (e) {
            }
        });
        scheduleGrid.init()

    }
});

$(function () {

    $('#moveToBtn').off().on('click', function () {
        moveToWindow.open();
    });
    $("#moveToSave").off().on("click", function () {
        let sourceId = scheduleGrid.getSelected();
        let selectCandidate = memoryStore.get('selectedData');
        let param = [];
        for (let i = 0; i < selectCandidate.length; i++) {
            let obj = {
                scheduleId: selectCandidate[i].scheduleId,
                applicationId: selectCandidate[i].applicationId
            }
            param.push(obj)
        }
        let data = {
            source: param,
            target: sourceId[0].id
        }
        moveToOtherSchedule(data).then((data) => {
            moveToWindow.close();
            globalEvent.trigger(actions.refresh)
        })
    })

});
