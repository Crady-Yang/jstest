import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { editMenu } from '../../../controller/rbac/menu';
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection';

let globalEvent = memoryStore.get('globalEvent');
let apiCollection = memoryStore.get('api');
let editMenuDto = ApiCollection['post/admin/Menu/Edit'].reqDto;

let editMenuForm = null;
let editMenuWindow = new KendoWindow('#editWindow',{
	title:'Edit Menu',
	open:function () {
		let selectedData = memoryStore.get('selectedData');
		if(!editMenuForm){
			editMenuForm = new Form('#editWindow',{
				dto:editMenuDto,
				onSubmit:function () {
					let t = editMenuForm.getValue();
					let selectedData = memoryStore.get('selectedData');
					t.id = selectedData.id;
					t.resourceId = selectedData.resourceId;
					t.parentId = selectedData.parentId || '00000000-0000-0000-0000-000000000000';
					editMenu(t).then((data)=>{
						//clear form + close form
						editMenuForm.cancelLoading();
						editMenuForm.clearForm();
						editMenuWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						editMenuForm.cancelLoading();
					})
				}
			});
		}

		editMenuForm.setValue(selectedData);
	}
});

$(function () {

	globalEvent.on(actions.openEdit,function () {
		editMenuWindow.open();
	})

});
