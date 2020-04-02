import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { addBlogCategory } from '../../../controller/blog/blogCate'

let globalEvent = memoryStore.get('globalEvent');
let addDto = ApiCollection['post/admin/BlogCategory/AddBlogCategory'].reqDto;

let addForm = null;
//displayorder数字框渲染
function numbericInputRend() {
    if (!$("#addBlogCateDisplayOrder").data("kendoNumericTextBox")) {
        $("#addBlogCateDisplayOrder").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }

}
let addWindow = new KendoWindow('#addWindow', {
    title: '添加博客分类',
    open: function () {
        numbericInputRend()
        if (!addForm) {
            addForm = new Form('#addWindow', {
                dto: addDto,
                onSubmit: function () {
                    let t = addForm.getValue();
                    addBlogCategory(t).then((data) => {
                        //clear form + close form
                        addForm.cancelLoading();
                        addForm.clearForm();
                        addWindow.close();
                        globalEvent.trigger(actions.refresh);
                    }).catch((error) => {
                        addForm.cancelLoading();
                    })
                }
            });
        }
    }
});

$(function () {

    $('#addBtn').on('click', function () {
        addWindow.open();
    });


});
