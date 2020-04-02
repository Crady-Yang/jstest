import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { addRole } from '../../../controller/rbac/role'

let globalEvent = memoryStore.get('globalEvent');
let addRoleDto = ApiCollection['post/admin/Role/Create'].reqDto;

let addRoleForm = null;


let addRoleWindow = new KendoWindow('#addWindow',{
	title:'Add Role',
	open:function () {
		if(!addRoleForm){
			addRoleForm = new Form('#addWindow',{
				dto:addRoleDto,
				onSubmit:function () {
					let t = addRoleForm.getValue();
                    t.schoolId = memoryStore.get('selectedSchoolId');
					addRole(t).then((data)=>{
						//clear form + close form
						addRoleForm.cancelLoading();
						addRoleForm.clearForm();
						addRoleWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						addRoleForm.cancelLoading();
					})
				}
			});
		}
	}
});

$(function () {

	$('#addBtn').on('click',function () {
		addRoleWindow.open();
	});


});
