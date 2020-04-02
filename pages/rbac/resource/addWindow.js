import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import {actions} from "./actions";
import { addResource } from '../../../controller/rbac/resource'
import { ApiCollection } from '../../../common/apiCollection'
import { ResourceTypeObjectInstance } from '../../../objectValue/rbac/resourceType'

let globalEvent = memoryStore.get('globalEvent');
let addResourceDto = ApiCollection['post/admin/Resource/Create'].reqDto;

let addResourceForm = null;
let resourceTypeSelector = null;


let addResourceWindow = new KendoWindow('#addWindow',{
	title:'Add Resource',
	open:function () {
		if(!addResourceForm){
			addResourceForm = new Form('#addWindow',{
				dto:addResourceDto,
				onSubmit:function () {
                    let t = addResourceForm.getValue();
                    t.resourceType = parseInt(t.resourceType)
					addResource(t).then((data)=>{
						//clear form + close form
						addResourceForm.cancelLoading();
						addResourceForm.clearForm();
						addResourceWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						addResourceForm.cancelLoading();
					})
				}
			});
		}
		if(!resourceTypeSelector){
			resourceTypeSelector = $('#addWindow').find('[name=resourceType]').kendoDropDownList({
				dataSource:ResourceTypeObjectInstance.toObjectArray(),
				dataTextField: "value",
				dataValueField: "id"
			}).data('kendoDropDownList')
		}
	}
});

$(function () {

	$('#addBtn').on('click',function () {
		addResourceWindow.open();
	});


});
