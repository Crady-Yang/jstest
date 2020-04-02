import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { editCourse } from '../../../controller/systemSetting/course'

let globalEvent = memoryStore.get('globalEvent');
let editDto = ApiCollection['post/admin/Major/Edit'].reqDto;

let editForm = null;
let editWindow = new KendoWindow('#editWindow', {
    title: '编辑科目',
    open: function () {
        let selectedData = memoryStore.get('selectedData');
        if (!editForm) {
            editForm = new Form('#editWindow', {
                dto: editDto,
                onSubmit: function () {
                    let t = editForm.getValue();
                    t.schoolId = memoryStore.get('selectedSchoolId');
                    t.collegeId = memoryStore.get('selectedCollegeId');
                    t = Object.assign(selectedData, t);
                    editCourse(t).then((data) => {
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
