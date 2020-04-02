import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { editBlogCategory } from '../../../controller/blog/blogCate'

let globalEvent = memoryStore.get('globalEvent');
let editDto = ApiCollection['post/admin/BlogCategory/ModifyBlogCategory'].reqDto;

let editForm = null;

//displayorder数字框渲染
function numbericInputRend() {
    if (!$("#editBlogCateDisplayOrder").data("kendoNumericTextBox")) {
        $("#editBlogCateDisplayOrder").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }

}
let editWindow = new KendoWindow('#editWindow', {
    title: '编辑博客分类',
    open: function () {
        numbericInputRend()
        let selectedData = memoryStore.get('selectedData');
        if (!editForm) {
            editForm = new Form('#editWindow', {
                dto: editDto,
                onSubmit: function () {
                    let t = editForm.getValue();
                    t.id = memoryStore.get('selectedData').id
                    editBlogCategory(t).then((data) => {
                        //clear form + close form
                        editForm.cancelLoading();
                        editForm.clearForm();
                        editWindow.close();
                        globalEvent.trigger(actions.refresh);
                    }).catch((error) => {
                        editForm.cancelLoading();
                    })
                }
            });
        }
        editForm.setValue(selectedData);
    }
});

$(function () {

    globalEvent.on(actions.openEdit, function () {
        editWindow.open();
    })


});
