import { KendoWindow } from '../../../component/kendo/window';
import { getRoleList } from '../../../controller/rbac/role';
import { authRole2User } from '../../../controller/user'
import { LoadingContainer } from '../../../component/loadingContainer'
import {Form} from "../../../component/form";
import { ThemeColor } from '../../../common/theme';
import {actions} from "./actions";
import { diff } from '../../../common/utils'

let globalEvent = memoryStore.get('globalEvent');
let authRoleLoading = null;
let authRoleForm = null;

function rendRoleList(roleList, userRole) {
    console.log(roleList)
	let $list = $('#authRole2UserWindow').find('.roleList');
	let dom = '';
	for(let i=0;i<roleList.length;i++){
		let t = roleList[i];
		//let enableDom = !t.enabled ? '<span class="lw-label label-disable">disabled</span>':'';
        let ifCheck = t.isSelect? 'checked':'';
		dom += `
			<div class="roleItem clearfix" style="padding: 4px 0px">
				<div class="pull-left">
					<input type="checkbox" name="${t.id}" id="authRoleWindow_${t.id}" ${ifCheck} class="k-checkbox"/>
	        <label class="control-label k-checkbox-label" for="authRoleWindow_${t.id}">${t.name}</label>
				</div>
				<div class="pull-left">
					
				</div>
			</div>
		`;
	}
	$list.append(dom)
}
function filterUserSelectRole(roleList) {
    let selectList = [];
    roleList.map((v) => {
        if (v.isSelect) {
            selectList.push(v.id)
        }
    })
    return selectList
}
function getSubmitData(roleData,currentData){
	let c = [];
	for(let k in currentData){
		if(currentData[k]){
			c.push(k)
		}
	}
    let d = diff(roleData,c);
	console.log('--- getSubmitData ----');
	console.log(d);
    return {
        "userId": memoryStore.get('selectedUserId'),
        "add": d.add,
        "delete": d.remove
	}
}

let authRoleWindow = new KendoWindow('#authRole2UserWindow',{
	title:'Auth Role',
	size:'small',
	open:function () {
		let $list = $('#authRole2UserWindow').find('.roleList');
        let userData = memoryStore.get('selectedUserData');
		let roleData = userData.roles;
		if(!authRoleLoading){
			authRoleLoading = new LoadingContainer($list,{ color:ThemeColor["title-h"] })
		}
		if(!authRoleForm){
			authRoleForm = new Form('#authRole2UserWindow',{
				onSubmit(){
                    let currentData = authRoleForm.getValue();
                    let roleData = memoryStore.get('userIsSelectedRoleData');
                    let data = getSubmitData(roleData, currentData);
					authRole2User(data).then((data)=>{
						authRoleForm.cancelLoading();
						authRoleForm.clearForm();
						authRoleWindow.close();
						globalEvent.trigger('refreshUser');
					}).catch((err)=>{
						authRoleForm.cancelLoading()
					})
				}
			})
		}
		$list.empty();
		authRoleLoading.start();
		getRoleList({
            userId: userData.id
        }).then((v) => {
            authRoleLoading.stop();
            rendRoleList(v.list, roleData)
            let selectList = filterUserSelectRole(v.list)
            memoryStore.set('userIsSelectedRoleData', selectList);
        }).catch((error) => {
            console.log(error)
			authRoleLoading.stop();
			$list.append('Error')
		})
	}
});

$(function () {

	globalEvent.on(actions.openUserRoleAuthWindow,function () {
		authRoleWindow.open();
	})

});
