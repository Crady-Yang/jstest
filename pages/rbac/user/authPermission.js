import { KendoWindow } from '../../../component/kendo/window'
import {actions} from "./actions";
import { AuthPermissionGrid } from '../../../component/rbac/authPermissionGrid'

let globalEvent = memoryStore.get('globalEvent');
let authPermissionGrid = null;

let authPermissionWindow = new KendoWindow('#authPermission2UserWindow',{
	title:'Auth Permission',
	size:'large',
	open:function () {
		let userData = memoryStore.get('selectedUserData');
		if(!userData){
			return;
		}
		let id = userData.id;
		if(!authPermissionGrid){
			authPermissionGrid = new AuthPermissionGrid('#authPermission2UserGrid',{ type:'user' })
		}
		authPermissionGrid.init({
			id
		})
	}
});

$(function () {
	globalEvent.on(actions.openUserPermissionAuthWindow,function () {
		authPermissionWindow.open();
	})
});
