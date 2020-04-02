import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import {actions} from "./actions";
import { editResource } from '../../../controller/rbac/resource'
import { ApiCollection } from '../../../common/apiCollection'
import { ResourceTypeObjectInstance } from '../../../objectValue/rbac/resourceType'

let globalEvent = memoryStore.get('globalEvent');
let editResourceDto = ApiCollection['post/admin/Resource/Edit'].reqDto;

let editResourceForm = null;
let resourceTypeSelector = null;


let editResourceWindow = new KendoWindow('#editWindow',{
	title:'Edit Resource',
	open:function () {
		let selectedData = memoryStore.get('selectedData');
		if(!editResourceForm){
			editResourceForm = new Form('#editWindow',{
				dto:editResourceDto,
				onSubmit:function () {
					let t = editResourceForm.getValue();
					let selectedData = memoryStore.get('selectedData');
                    t.id = selectedData.id;
                    t.resourceType = parseInt(t.resourceType)
					editResource(t).then((data)=>{
						//clear form + close form
						editResourceForm.cancelLoading();
						editResourceForm.clearForm();
						editResourceWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						editResourceForm.cancelLoading();
					})
				}
			});
		}
		if(!resourceTypeSelector){
			resourceTypeSelector = $('#editWindow').find('[name=resourceType]').kendoDropDownList({
				dataSource:ResourceTypeObjectInstance.toObjectArray(),
				dataTextField: "value",
				dataValueField: "id"
			}).data('kendoDropDownList')
		}
		editResourceForm.setValue(selectedData);
	}
});

$(function () {

	globalEvent.on(actions.openEdit,function () {
		editResourceWindow.open();
	})

});
