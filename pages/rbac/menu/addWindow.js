import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { addMenu } from '../../../controller/rbac/menu';
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection';
import { getResourceSelectDataSource } from '../../../controller/rbac/resource'
import { ResourceTypeObjectInstance } from '../../../objectValue/rbac/resourceType'

let globalEvent = memoryStore.get('globalEvent');
let apiCollection = memoryStore.get('api');
let addMenuDto = ApiCollection['post/admin/Menu/Create'].reqDto;

let pageType = ResourceTypeObjectInstance.get('page').id;
let addMenuForm = null;
let resourceSelector = null;
let resourceDataSource = null;
let addMenuWindow = new KendoWindow('#addWindow',{
	title:'Add Menu',
    open: function () {
        if (!resourceSelector) {
            resourceDataSource = getResourceSelectDataSource().mergeQuery(function () {
                return {
                    page: 1,
                    pageSize: 10000,
                    companyId: memoryStore.get('selectedCompanyId'),
                    resourceType: pageType
                }
            }).dataSource;
            resourceSelector = $('#addWindow').find('[name=resourceId]').kendoDropDownList({
                dataSource: resourceDataSource,
                dataTextField: 'name',
                dataValueField: 'id',
                filter: "contains",
                // dataBound:function () {
                // 	let data = resourceDataSource.data();
                // 	let resourceId = data[0] ? data[0].id:'';
                // 	this.value(resourceId)
                // }
            }).data('kendoDropDownList');
        } else {
            resourceDataSource.read()
        }
		if(!addMenuForm){
			addMenuForm = new Form('#addWindow',{
				dto:addMenuDto,
				onSubmit:function () {
					let t = addMenuForm.getValue();
					let parentId = addMenuWindow.data === 'sub' ? memoryStore.get('selectedId'):'00000000-0000-0000-0000-000000000000';
					t.parentId = parentId;
					addMenu(t).then((data)=>{
						//clear form + close form
						addMenuForm.cancelLoading();
						addMenuForm.clearForm();
						addMenuWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						addMenuForm.cancelLoading();
					})
				}
			});
		}
	}
});


$(function () {

	globalEvent.on(actions.openAddSub,function () {
		addMenuWindow.open('sub');
	});

	$('#addBtn').on('click',function () {
		addMenuWindow.open();
	});


});
