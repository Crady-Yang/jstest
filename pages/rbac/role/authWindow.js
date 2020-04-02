import { KendoWindow } from '../../../component/kendo/window'
import {actions} from "./actions";
import { AuthPermissionGrid } from '../../../component/rbac/authPermissionGrid'

let globalEvent = memoryStore.get('globalEvent');
let authPermissionGrid = null;

let authPermissionWindow = new KendoWindow('#authPermissionWindow',{
	title:'Auth Permission',
	size:'large',
	open:function () {
		let selectedData = memoryStore.get('selectedData');
        let id = selectedData.id;
		if(!authPermissionGrid){
			authPermissionGrid = new AuthPermissionGrid('#authPermissionWindow',{ type:'role' })
		}
		authPermissionGrid.init({
			id
		})
	}
});

$(function () {
	globalEvent.on(actions.openAuth,function () {
		authPermissionWindow.open();
	})
});
