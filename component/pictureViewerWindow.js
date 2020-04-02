import { BaseComponent } from "./baseComponent";
import { getPictureList } from '../controller/picture/picture';
import { KendoWindow } from '../component/kendo/window';
import { KendoUploader } from "../component/kendo/uploader";
import { createGuid } from '../common/utils'
let eventBus = memoryStore.get('GlobalEvent');

//let opt = {
//    pictureDataSource:'',//listView的datasource
//    windowEl:'',//modal的el
//    title:'',//modal的title
//    listViewEl:'',//listView的title
//    otherOpt: '',//其他初始化listView的参数
//    pickPicCallback: function () {}//选择了图片点击确认后的回调
//}
export class PictureViewerWindow extends BaseComponent {
    constructor(el, opt) {
        opt = opt || {};
        super(el, opt);
        this.pictureDataSource = getPictureList().dataSource || opt.dataSource;
        this.windowEl = el || null;
        this.title = opt.title || '选择图片';
        this.$list = null;
        this.$page = null;
        this.pager = null;
        this.$select = null;
        this.$upload = null;
        this.otherOpt = opt.otherOpt;
        this.pickPicCallback = opt.pickPicCallback || function () { };//选择图片后回调
        this.uploadPicCallback = opt.uploadPicCallback || function () { };//上传图片后回调
        this.pickPicWindow = null;
        this.pickPicWindowInstance = null;
        this.picListView = null;
        this.uploader = null;
        this.uploadWindow = null;
        this.uid = createGuid();
    }

    initDom() {
        if (!this.$list) {
            this.$el.empty().append(`
            <div class="btnGroup">
                <button class="k-button k-default pictureViewerWindow-confirm" data-submit="true">确认</button>
                <button class="k-button k-default pictureViewerWindow-upload" data-submit="true">上传图片</button>
            </div>
            <ul class="clearfix pictureViewerWindow-list"></ul>
            <div class="k-pager-wrap pictureViewerWindow-pager"></div>
        `);
            $('body').append(`<div class="uploadImageModal" id="${this.uid}-uploadImageModal" style="display:none;">
                            <div class="uploadBox clearfix">
                                <input id="${this.uid}-uploadImage" name="file" type="file" />
                            </div>
                        </div>`);
            this.$list = this.$el.find('.pictureViewerWindow-list');
            this.$page = this.$el.find('.pictureViewerWindow-pager');
            this.$select = this.$el.find('.pictureViewerWindow-confirm');
            this.$openUploadBtn = this.$el.find('.pictureViewerWindow-upload');
            this.$uploadWindow = $(`#${this.uid}-uploadImageModal`);
            this.$uploadBtn = $(`#${this.uid}-uploadImage`)
        }
    }

    pickPictureWindowRend() {
        let that = this;
        let listPager = null;
        let defaultOpt = {
            dataSource: that.pictureDataSource,
            selectable: "single",
            template: function (dataItem) {
                let itemHtml = `<li class="picture pull-left" style="width: 175px;height:175px;margin:10px">
                                        <img width="100%" height="auto" src="../${dataItem.virtualPath}"/>
                                    </li>`
                return itemHtml
            }
        };
        let finalOpt = Object.assign({}, defaultOpt, that.otherOpt);

        if (!that.pickPicWindowInstance) {
            that.initDom();
            that.pickPicWindow = new KendoWindow(that.windowEl, {
                title: that.title,
                size: 'large',
                open: function () {
                    if (!that.picListView) {
                        that.picListView = that.$list.kendoListView(finalOpt).data("kendoListView");
                    } else {
                        that.pictureDataSource.read()
                    }
                    if (!that.pager) {
                        that.pager = that.$page.kendoPager({
                            dataSource: that.pictureDataSource,
                            refresh: true
                        }).data("kendoPager");
                    }
                }
            });
            that.pickPicWindowInstance = that.$el.data("kendoWindow")
        } else {
            console.log(that.pickPicWindowInstance)
        }
    }

    //上传图片
    uploadWindowInit() {
        let that = this;
        if (!that.uploadWindow) {
            that.uploadWindow = new KendoWindow(that.$uploadWindow, {
                title: '上传图片',
                open: function () {
                    if (!this.uploader) {
                        this.uploader = new KendoUploader(that.$uploadBtn, {
                            type: 'publicPicture',
                            selectText: '选择图片',
                            upload: function (e) {
                                e.data = {
                                    provider: 1
                                };
                            },
                            success: function (e) {
                                let data = {
                                    id: e.response.data
                                };
                                that.uploadWindow.close();
                                that.uploadPicCallback(data)
                            }
                        })
                    }
                }
            })
        }
        that.uploadWindow.open()
    }

    open() {
        this.pickPicWindow.open();
    }

    close() {
        this.pickPicWindow.close();
    }

    init() {
        let that = this;
        that.pickPictureWindowRend();
        that.$select.off('click').on("click", function () {
            let selectItem = that.picListView.select();
            let dataItem = that.picListView.dataItem(selectItem);
            that.pickPicWindow.close();
            that.pickPicCallback(dataItem)
        });

        that.$openUploadBtn.off('click').on("click", function () {
            that.uploadWindowInit()
        });
        // eventBus.on("openPickPictureWindow", function () {
        //     that.pickPicWindow.open()
        // })
        // eventBus.on("closePickPictureWindow", function () {
        //     that.pickPicWindow.close()
        // })
    }

}