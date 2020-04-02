import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { addCourse } from '../../../controller/systemSetting/course'

let globalEvent = memoryStore.get('globalEvent');
let addDto = ApiCollection['post/admin/Course/Create'].reqDto;

let addForm = null;
let addWindow = new KendoWindow('#addWindow',{
	title:'添加科目',
    open: function () {
		if(!addForm){
			addForm = new Form('#addWindow',{
				dto:addDto,
				onSubmit:function () {
					let t = addForm.getValue();
                    t.schoolId = memoryStore.get('selectedSchoolId');
                    t.collegeId = memoryStore.get('selectedCollegeId');
                    addCourse(t).then((data)=>{
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

	$('#addBtn').on('click',function () {
		addWindow.open();
	});


});
