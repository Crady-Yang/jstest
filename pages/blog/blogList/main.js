import { KendoGrid } from '../../../component/kendo/grid';
import * as blogController from '../../../controller/blog/blog';
import { GlobalEventName } from '../../../common/globalEventName';
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { ConfirmWindow } from "../../../component/confirmWindow";
import { actions } from "./actions";

let eventBus = memoryStore.get('globalEvent');
let blogGrid = null;
let gridDataSource = null;

function gridInit() {
    gridDataSource = blogController.getBlogList().mergeQuery(function () {
        return {
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if (blogGrid) {
        $('#grid').data('kendoGrid').destroy();
        $('#grid').empty();
    };
    blogGrid = new KendoGrid('#grid', {
        columns: [{
            field: 'id',
            title: '操作',
            filterable: false,
            width: 150,
            template: function (dataItem) {
                if (dataItem.enabled) {
                    return `
              <ul class="actionMenu hidden" style="display: inline-block">
                <li>
                  操作
                  <ul>
                    <li data-id="${dataItem.id}" data-action="${actions.openEdit}">编辑</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openDelete}">删除</li>
                    <li data-id="${dataItem.id}" data-action="${actions.openDisable}">禁用</li>
                  </ul>
                </li>	
              </ul>
            `
                } else {
                    return `<button data-action="${actions.openEnable}" data-id="${dataItem.id}" class="enableBtn k-button k-icon-button">启用</button>`
                }
            }
        },
        // {
        //     field: 'name',
        //     title: '名称',
        //     width: 150,
        // },
        {
            field: 'title',
            title: '标题',
            width: 150,
        },
        {
           field: 'displayOrder',
           title: '排序',
           width: 100,
        },
        //{
        //    field: 'slug',
        //    title: 'Slug地址',
        //    width: 150,
        //},
        //{
        //    field: 'isDisplay',
        //    title: '是否展示',
        //    width: 130,
        //    template: function (dataItem) {
        //        return BooleanTemplate(dataItem.isDisplay)
        //    },
        //    filterable: {
        //        messages: {
        //            isTrue: "展示",
        //            isFalse: "不展示"
        //        }
        //    }
        //},
        {
           field: 'isShowHome',
           title: '是否推荐到首页',
           width: 180,
           template: function (dataItem) {
               return BooleanTemplate(dataItem.isShowHome)
           },
           filterable: {
               messages: {
                   isTrue: "推荐",
                   isFalse: "不推荐"
               }
           }
        },
        {
            field: 'isTop',
            title: '是否置顶',
            width: 130,
            template: function (dataItem) {
                return BooleanTemplate(dataItem.isTop)
            },
            filterable: {
                messages: {
                    isTrue: "置顶",
                    isFalse: "不置顶"
                }
            }
        },
        {
            field: 'isPublish',
            title: '是否发布',
            width: 130,
            template: function (dataItem) {
                return BooleanTemplate(dataItem.isPublish)
            },
            filterable: {
                messages: {
                    isTrue: "发布",
                    isFalse: "不发布"
                }
            }
        },
        {
            field: 'enabled',
            title: '启用',
            width: 100,
            template: function (dataItem) {
                return BooleanTemplate(dataItem.enabled)
            },
            filterable: {
                messages: {
                    isTrue: "启用",
                    isFalse: "禁用"
                }
            }
        },
            {
                field: 'creationTime',
                title: '创建时间',
                width: 150,
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
        // {
        //     field: 'publishDate',
        //     title: '发布时间',
        //     width: 150,
        //     format: "{0: yyyy-MM-dd HH:mm:ss}",
        //     filterable: {
        //         extra: true,
        //         ui: "datetimepicker",
        //         messages: {
        //             info: "请选择开始时间和结束时间"
        //         },
        //         operators: {
        //             date: {
        //                 gt: "开始时间",
        //                 lt: "结束时间"
        //             }
        //         },
        //     }
        // },
        ],
        dataSource: gridDataSource,
        dataBound: function (e) {
            $('#grid').find('.actionMenu').kendoMenu({
                select: function (e) {
                    let id = e.item.getAttribute('data-id');
                    let data = gridDataSource.get(id);
                    let action = e.item.getAttribute('data-action');
                    memoryStore.set('selectedId', id);
                    memoryStore.set('selectedData', data);
                    if (action) {
                        eventBus.trigger(action);
                    }
                    e.preventDefault()
                }
            }).removeClass('hidden');
            //bind button
            $('#grid').find('.enableBtn').on('click', function () {
                let id = this.getAttribute('data-id');
                let data = gridDataSource.get(id);
                let action = this.getAttribute('data-action');
                memoryStore.set('selectedId', id);
                memoryStore.set('selectedData', data);
                if (action) {
                    eventBus.trigger(action);
                }
            })
        },

    });
    blogGrid.init()
}
$(function () {
    eventBus.on(GlobalEventName.SelectCollege, function (value) {
        gridInit()
    })
    eventBus.on(GlobalEventName.CollegeChange, function (value) {
        gridInit()
    })
    eventBus.on(actions.refresh, function () {
        gridDataSource.read();
    });
    let deleteConfirmWindow = new ConfirmWindow('#deleteWindow', {
        type: 'delete',
        onSubmit: blogController.deleteBlog,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let enableConfirmWindow = new ConfirmWindow('#enableWindow', {
        type: 'enable',
        onSubmit: blogController.editBlog,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    let disableConfirmWindow = new ConfirmWindow('#disableWindow', {
        type: 'disable',
        onSubmit: blogController.editBlog,
        onSuccess: function () {
            eventBus.trigger(actions.refresh)
        }
    });

    eventBus.on(actions.openEdit, function () {
        let id = memoryStore.get('selectedId');
        window.location.href = `/admin/addblog?blogId=${id}`
    });
    eventBus.on(actions.openDelete, function () {
        deleteConfirmWindow.open(memoryStore.get('selectedData'))
    });

    eventBus.on(actions.openEnable, function () {
        enableConfirmWindow.open(memoryStore.get('selectedData'))
    });

    eventBus.on(actions.openDisable, function () {
        disableConfirmWindow.open(memoryStore.get('selectedData'))
    });
})