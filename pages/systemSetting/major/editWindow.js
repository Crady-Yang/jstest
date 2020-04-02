import { KendoWindow } from '../../../component/kendo/window';
import { CourseSelect } from './courseSelect';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { editMajor } from '../../../controller/systemSetting/major'
import { MajorTypeObjectInstance } from '../../../objectValue/systemSetting/majorType'
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType'

let globalEvent = memoryStore.get('globalEvent');
let editDto = ApiCollection['post/admin/Major/Edit'].reqDto;

let editForm = null;
let majorTypeDataSource = MajorTypeObjectInstance.toObjectArray()
let majorTypeDropdownList = null;
let studyTypeDataSource = StudyTypeObjectInstance.toObjectArray()
let studyTypeDropdownList = null;
let courseSelect = new CourseSelect("#editWindow input[name='examinationCourseId']",{selectElParent: "#editWindow .courseSelectBox" })

function majorTypeDropdownInit() {
    if (!majorTypeDropdownList) {
        majorTypeDropdownList = $("#editWindow").find('[name="majorType"]').kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: majorTypeDataSource,
            index: 0,
        })
    }
}
function studyTypeDropdownInit() {
    if (!studyTypeDropdownList) {
        studyTypeDropdownList = $("#editWindow").find('[name="studyType"]').kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: studyTypeDataSource,
            index: 0,
        })
    }
}
let editWindow = new KendoWindow('#editWindow', {
    title: '编辑专业',
    open: function () {
        majorTypeDropdownInit()
        studyTypeDropdownInit()
        //courseSelect.init()
        let selectedData = memoryStore.get('selectedData');
        if (!editForm) {
            editForm = new Form('#editWindow', {
                dto: editDto,
                onSubmit: function () {
                    let t = editForm.getValue();
                    t.id = selectedData.id
                    editMajor(t).then((data) => {
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
