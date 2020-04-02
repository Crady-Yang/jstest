import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { addResult } from '../../../controller/retestManagement/examinationResults'

let globalEvent = memoryStore.get('globalEvent');
let addDto = ApiCollection['post/admin/Result/Create'].reqDto;

let addForm = null;

function numbericInit() {
    if (!$("#addWindow input[name='writtenScore']").data("kendoNumericTextBox")) {
        $("#addWindow input[name='writtenScore']").kendoNumericTextBox({
            format: "n0",
            min: 0,
            value:0
        })
    }
    if (!$("#addWindow input[name='interviewScore']").data("kendoNumericTextBox")) {
        $("#addWindow input[name='interviewScore']").kendoNumericTextBox({
            format: "n0",
            min: 0,
            value: 0
        })
    }
    if (!$("#addWindow input[name='examinationScore']").data("kendoNumericTextBox")) {
        $("#addWindow input[name='examinationScore']").kendoNumericTextBox({
            format: "n0",
            min: 0,
            value: 0
        })
    }
    if (!$("#addWindow input[name='totalScore']").data("kendoNumericTextBox")) {
        $("#addWindow input[name='totalScore']").kendoNumericTextBox({
            format: "n0",
            min: 0,
            value: 0
        })
    }
}
let addWindow = new KendoWindow('#addWindow',{
	title:'添加复试成果',
    open: function () {
        numbericInit()
		if(!addForm){
			addForm = new Form('#addWindow',{
				dto:addDto,
                onSubmit: function () {
                    let selectedUserId = memoryStore.get('selectedUserId');
                    let selectedApplicationId = memoryStore.get('selectedApplicationId')
                    let t = addForm.getValue();
                    t.userId = selectedUserId;
                    t.applicationId = selectedApplicationId
                    t.schoolId = memoryStore.get('selectedSchoolId');
                    t.collegeId = memoryStore.get('selectedCollegeId');
                    addResult(t).then((data)=>{
						//clear form + close form
						addForm.cancelLoading();
						addForm.clearForm();
						addWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						addForm.cancelLoading();
					})
				}
			});
		}
	}
});

$(function () {

    globalEvent.on('addResult',function () {
		addWindow.open();
	});


});
