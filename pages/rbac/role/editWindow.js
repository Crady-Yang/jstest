import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import {actions} from "./actions";
import { editRole } from '../../../controller/rbac/role'
import { ApiCollection } from '../../../common/apiCollection'

let globalEvent = memoryStore.get('globalEvent');
let editRoleDto = ApiCollection["post/admin/Role/Edit"].reqDto;

let editRoleForm = null;


let editRoleWindow = new KendoWindow('#editWindow',{
	title:'Edit Role',
	open:function () {
		let selectedData = memoryStore.get('selectedData');
		if(!editRoleForm){
			editRoleForm = new Form('#editWindow',{
				dto:editRoleDto,
				onSubmit:function () {
					let t = editRoleForm.getValue();
					let selected = memoryStore.get('selectedData');
                    let schoolId = memoryStore.get('selectedSchoolId');
					t = Object.assign(selected,t);
                    t.schoolId = schoolId;
					editRole(t).then((data)=>{
						//clear form + close form
						editRoleForm.cancelLoading();
						editRoleForm.clearForm();
						editRoleWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						editRoleForm.cancelLoading();
					})
				}
			});
		}
		editRoleForm.setValue(selectedData);
	}
});

$(function () {

	globalEvent.on(actions.openEdit,function () {
		editRoleWindow.open();
	})

});
