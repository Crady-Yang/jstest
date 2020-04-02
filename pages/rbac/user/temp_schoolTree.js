import { actions } from './actions'
let eventBus = memoryStore.get('globalEvent');
export function schoolTreeItem(dataItem) {
    let currentUserCollegeId = memoryStore.get("currentUserInfo").collegeId
    dataItem = dataItem.item;
    let disabledTreeNodeClass = !dataItem.schoolEnabled ? 'disabledTreeNode' : '';
    let type=''
    let systemTagDom = dataItem.schoolIsSystem || dataItem.collegeIsSystem ? '<span class="lw-label pull-left">system</span>' : '';
    let disableTagDom = (dataItem.schoolEnabled === false || dataItem.collegeEnabled === false) ? '<span class="lw-label label-disable pull-left">disabled</span>' : '';
    //如果是院级管理员则不能有添加学院的按钮
    let addCollegeDom = currentUserCollegeId ==="00000000-0000-0000-0000-000000000000"?`<li data-id="${dataItem.id}" data-type="school" data-action="${actions.openSchoolAddCollege}">添加学院</li>`:""
	let liDom = '';
    if (!dataItem.hasChildren && dataItem.colleges === undefined){
        if (dataItem.collegeEnabled) {
            liDom = `
                <li data-id="${dataItem.id}"  data-action="${actions.openCollegeEdit}">编辑</li>
                <li data-id="${dataItem.id}" data-action="${actions.openCollegeDelete}">删除</li>
                <li data-id="${dataItem.id}" data-action="${actions.openCollegeDisable}">禁用</li>
                <li data-id="${dataItem.id}" data-action="${actions.openCollegeIfSendMessage}">开启/关闭短信</li>
		        `
        } else {
            liDom = `
                <li data-id="${dataItem.id}" data-action="${actions.openCollegeEnable}">启用</li>
		        `
        }
    } else {
        if (dataItem.schoolEnabled) {
            liDom = `
            ${addCollegeDom}
            <li data-id="${dataItem.id}" data-type="school" data-action="${actions.openSchoolEdit}">编辑</li>
            <li data-id="${dataItem.id}" data-type="school" data-action="${actions.openSchoolDelete}">删除</li>
            <li data-id="${dataItem.id}" data-type="school" data-action="${actions.openSchoolDisable}">禁用</li>
            <li data-id="${dataItem.id}" data-type="school" data-action="${actions.openSchoolIfSendMessage}">开启/关闭短信</li>
			`
        } else {
            liDom = `
        <li data-id="${dataItem.id}" data-type="school" data-action="${actions.openSchoolEnable}">启用</li>
			`
        }
        
		   
	}
	return `
		<div class="clearfix wrapper schoolOperator ${disabledTreeNodeClass}">
    <span class="text pull-left">
        <span class="schoolTreeNode" data-type="${!dataItem.hasChildren && dataItem.colleges === undefined ? "" : "school"}" data-id="${dataItem.id}">${dataItem.schoolName ? dataItem.schoolName : dataItem.collegeName}</span>
      </span>
    ${systemTagDom}
    ${disableTagDom}
    <div class="treeMenuBox pull-left hidden">
      <ul class="treeMenu">
        <li>
          <span class="k-icon k-i-more-vertical"></span>
          <ul>
            ${liDom}
          </ul>
        </li>
      </ul>
    </div>
  </div>
	`
}
