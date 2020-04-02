import { actions } from './actions'
import { Config } from '../../../common/config';

export function userOperationTemplate(dataItem) {
    let currentUserSchoolId = memoryStore.get("currentUserInfo").schoolId
    let liDom = ``;
    let simulateLoginAction = ``
    if (currentUserSchoolId === Config["systemSchoolId"]) {
        simulateLoginAction = `<li data-id="${dataItem.id}" data-action="${actions.simulateLogin}">登录此账号</li>`
    }
	if(dataItem.enabled){
		return `
		<ul class="userMenu hidden">
      <li>
        操作
        <ul>
          <li data-id="${dataItem.id}" data-action="${actions.openUserEditWindow}">编辑</li>
					<li data-id="${dataItem.id}" data-action="${actions.openUserDisableWindow}">禁用</li>
					<li data-id="${dataItem.id}" data-action="${actions.openUserDeleteWindow}">删除</li>
					<li data-id="${dataItem.id}" data-action="${actions.openUserRoleAuthWindow}">配置角色</li>
					<li data-id="${dataItem.id}" data-action="${actions.openUserPermissionAuthWindow}">配置权限</li>
					<li data-id="${dataItem.id}" data-action="${actions.openResetPsdWindow}">重置密码</li>
                    ${simulateLoginAction}
        </ul>
      </li>	
    </ul>
	`
	}else {
		return `<button data-action="${actions.openUserEnableWindow}" data-id="${dataItem.id}" class="enableBtn k-button k-icon-button">enable</button>`
	}

}
