import { ApiCollection } from "../../../common/apiCollection";
import { Form } from "../../../component/form";
import { KendoWindow } from '../../../component/kendo/window';
import { addBlog, editBlog, getBlogInfoById } from '../../../controller/blog/blog';
import { getBlogSelectList } from '../../../controller/blog/blogCate';
import { getPicturePathById } from '../../../controller/picture/picture';
import { ImageLoader } from "../../../component/imageLoader";
import { KendoUploader } from "../../../component/kendo/uploader";
import { PageCollection } from '../../../service/page/pageCollection';
import { GlobalEventName } from '../../../common/globalEventName';
import { Config } from '../../../common/config';
import {getSchoolSelectList} from "../../../controller/rbac/school";
import {getCollegeSelectList} from "../../../controller/rbac/college";
let eventBus = memoryStore.get('globalEvent');
let addBlogForm = null;
let pictureViewerWindow = null;
let addBlogDto = ApiCollection['post/admin/Blog/AddBlog'].reqDto;
let blogId = null;
let cateDropdown = null;
let schoolDropdown = null;
let collegeDropdown = null;
let addPicUploader = null;
let addBlogPicUploader=null
let cateDataSource = getBlogSelectList().dataSource;
if (window.location.search) {
    blogId = window.location.search.split("&")[0].split("=")[1]

}
let addPicLoader = new ImageLoader($('#blogFrom').find('.portrait'), {
    type: 'public'
});
function insertImage(path) {
    let iframe = $('iframe');
    let view = iframe[0].contentDocument || iframe[0].contentWindow.document;
    let sel, range;
    if (view.getSelection) {
        sel = view.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            let el = document.createElement("div");
            el.innerHTML = `<img src="/${path}" />`;
            let frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        document.selection.createRange().pasteHTML(str);
    } else {
        Notification.show('当前浏览器不支持插入图片，请使用新版chrome浏览器', 'warning')
    }
}
//图文描述编辑框
function initEditor() {
    $("#blogFrom").find("textarea[name='content']").kendoEditor({
        resizable: {
            content: true,
            resize: true
        },
        tools: [
            'formatting', 'bold', 'italic', 'underline', 'strikethrough',
            'fontSize', 'foreColor', 'backColor',
            'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
            'createLink', 'unlink',
            'cleanFormatting', 'viewHtml',
            {
                name: 'image-insert',
                tooltip: 'insert image',
                exec: function (e) {
                    if (!pictureViewerWindow) {
                        pictureViewerWindow = new KendoWindow('#uploadImageModal', {
                            title: '上传图片',
                            open: function () {
                                if (!addBlogPicUploader) {
                                    addBlogPicUploader = new KendoUploader($('#uploadImage'), {
                                        type: 'publicPicture',
                                        selectText: '上传图片',
                                        upload: function (e) {
                                            e.data = {
                                                provider: 1
                                            };
                                        },
                                        success: function (e) {
                                            let path = e.response.data;
                                            pictureViewerWindow.close();
                                            getPicturePathById({ id: path}).then((data) => {
                                                insertImage(data)
                                            })
                                        }
                                    })
                                }
                            }

                        });
                    }
                    pictureViewerWindow.open()
                    //if (!pictureViewerWindow) {
                    //    pictureViewerWindow = new PictureViewerWindow('#editorPicturePickerWindow', {
                    //        pickPicCallback: function (dataItem) {
                    //            let path = dataItem.path;
                    //            insertImage(path)
                    //        },
                    //        uploadPicCallback: function (dataItem) {
                    //            pictureViewerWindow.close();
                    //            getPicturePathById(dataItem).then((data) => {
                    //                insertImage(data)
                    //            })
                    //        }
                    //    });
                    //    pictureViewerWindow.init()
                    //}
                    //pictureViewerWindow.open();

                }
            }
        ]
    });
}
//displayorder数字框渲染
function numbericInputRend() {
    if (!$("#addBlogDisplayOrder").data("kendoNumericTextBox")) {
        $("#addBlogDisplayOrder").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }
    
}
//分类下拉框
function cateDropdownInit() {
    if (!cateDropdown) {
        cateDropdown=$("#blogFrom").find("input[name='blogCategoryId']").kendoDropDownList({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: cateDataSource,
            index: 0,
        }).data("kendoDropDownList")
    }
}
//学校学院下拉框
function schoolDropdownInit(){
    let schoolData = getSchoolSelectList().mergeQuery(function () {
        return {
            isDisplaySystem: true
        }
    }).dataSource;
    let collegeDatasource = getCollegeSelectList().mergeQuery(function () {
        return {
            schoolId: schoolDropdown.value()
        }
    }).dataSource;
    if (!schoolDropdown) {
        schoolDropdown=$("#blogFrom").find("input[name='schoolId']").kendoDropDownList({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: schoolData,
            index: 0,
            change:function(){
                let schoolId=schoolDropdown.value();
                let blogName= $("#blogFrom input[name='name']").val();
                console.log(blogName)
                $("#blogFrom input[name='slug']").val(blogName+schoolId);
            }
        }).data("kendoDropDownList")
    }
    if (!collegeDropdown) {
        collegeDropdown=$("#blogFrom").find("input[name='collegeId']").kendoDropDownList({
            cascadeFrom: "schoolDropdown",//要写父级的id
            dataTextField: "name",
            dataValueField: "id",
            dataSource: collegeDatasource,
            optionLabel:"请选择学院"
        }).data("kendoDropDownList")
    }
}
function addBlogFormInit() {
    addPicLoader.load();
    if (!addPicUploader) {
        addPicUploader = new KendoUploader($('#blogFrom').find('.uploadPicture'), {
            type: 'publicPicture',
            selectText: '上传图片',
            upload: function (e) {
                e.data = {
                    provider: 1
                };
            },
            success: function (e) {
                let path = e.response.data;
                addPicLoader.load(path);
            }
        })
    }
    if (!addBlogForm) {
        addBlogForm = new Form('#blogFrom', {
            dto: addBlogDto,
            onSubmit: function () {
                let t = addBlogForm.getValue();
                // t.schoolId = schoolDropdown.value();
                // t.collegeId = collegeDropdown.value();
                t.pictureId = addPicLoader.path || "00000000-0000-0000-0000-000000000000";
                t.enabled = true;
                if (blogId) {
                    t.id = blogId;
                    t.mappingId = memoryStore.get("mappingId")
                    editBlog(t).then((data) => {
                        addBlogForm.cancelLoading();
                        window.location.href = `/admin/addblog?blogId=${blogId}`
                    }).catch((error) => {
                        addBlogForm.cancelLoading();
                    })
                } else {
                    addBlog(t).then((data) => {
                        addBlogForm.cancelLoading();
                        window.location.href = `/admin/addblog?blogId=${data}`
                    }).catch((error) => {
                        addBlogForm.cancelLoading();
                    })
                }
            }
        });
    }
}
//编辑状态下根据博客id获取详情
function getBlogDetail(id) {
    getBlogInfoById({ id: id }).then((data) => {
        addBlogForm.setValue(data)
        memoryStore.set("mappingId", data.mappingId)
        if (data.path) {
            $("#blogFrom").find("img").attr("src", `/${data.path}`)
        }
    })
}
$(function () {
    initEditor()
    numbericInputRend()
    schoolDropdownInit()
    cateDropdownInit()
    addBlogFormInit()
    //slug默认填充博客name+schoolId
    $("#blogFrom input[name='name']").blur(function () {
        let nameValue = $(this).val();
        let schoolId=schoolDropdown.value();
        $("#blogFrom input[name='slug']").val(nameValue+schoolId)
    })
    //不是系统管理员不显示分类//又不改了，还原回去
    //eventBus.on(GlobalEventName.getCurrentUserInfo, function (data) {
    //    if (data.schoolId !== Config.systemSchoolId) {
    //        $("#blogFrom .categoryItem").hide();
    //    } else {
    //        $("#blogFrom .categoryItem").show();
    //        cateDropdownInit()
    //    }
    //});
    if (blogId) {
        getBlogDetail(blogId)
    }
})

