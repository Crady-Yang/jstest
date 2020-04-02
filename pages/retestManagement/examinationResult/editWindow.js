import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { editResult } from '../../../controller/retestManagement/examinationResults'

let globalEvent = memoryStore.get('globalEvent');
let editDto = ApiCollection['post/admin/Result/Edit'].reqDto;

let editForm = null;

function numbericInit() {
    if (!$("#editWindow input[name='writtenScore']").data("kendoNumericTextBox")) {
        $("#editWindow input[name='writtenScore']").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }
    if (!$("#editWindow input[name='interviewScore']").data("kendoNumericTextBox")) {
        $("#editWindow input[name='interviewScore']").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }
    if (!$("#editWindow input[name='examinationScore']").data("kendoNumericTextBox")) {
        $("#editWindow input[name='examinationScore']").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }
    if (!$("#editWindow input[name='totalScore']").data("kendoNumericTextBox")) {
        $("#editWindow input[name='totalScore']").kendoNumericTextBox({
            format: "n0",
            min: 0
        })
    }
}
let editWindow = new KendoWindow('#editWindow',{
	title:'修改成绩',
    open: function () {
        numbericInit()
        let resultData = memoryStore.get('selectedData')
		if(!editForm){
			editForm = new Form('#editWindow',{
                dto: editDto,
                onSubmit: function () {
                    let selectedData = memoryStore.get('selectedData')
                    let t = editForm.getValue();
                    t.id = selectedData.id;
                    t.userId = selectedData.userId;
                    t.applicationId = selectedData.applicationId;
                    editResult(t).then((data)=>{
						//clear form + close form
						editForm.cancelLoading();
						editForm.clearForm();
						editWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						editForm.cancelLoading();
					})
				}
            });
           
        }
        editForm.setValue(resultData)
	}
});

$(function () {

    globalEvent.on('editResult',function () {
		editWindow.open();
	});


});
