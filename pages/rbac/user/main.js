import "babel-polyfill";
import { getSchoolTreeList, deleteSchool, editSchool } from '../../../controller/rbac/school';
import { deleteCollege, editCollege } from '../../../controller/rbac/college';
import { LoadingContainer } from '../../../component/loadingContainer';
import { schoolTreeItem } from './temp_schoolTree';
import { getAdminList, enableUser, deleteUser, adminResetPassword ,SimulatedSchoolManagement} from '../../../controller/user';
import { KendoGrid } from '../../../component/kendo/grid';
import { actions } from './actions';
import { ThemeColor } from '../../../common/theme';
import { ConfirmWindow } from '../../../component/confirmWindow';
import { userOperationTemplate } from './temp_user_operator'
import { getRoleDropDownList } from '../../../controller/rbac/role'
import { getResourceDropDownList } from '../../../controller/rbac/resource'
import { BooleanTemplate } from '../../../component/booleanTemplate';
import { GlobalEventName } from '../../../common/globalEventName';
import { Config } from '../../../common/config';

import './addSchool';
import './editSchool';
import './addCollege';
import './editCollege'
import './addUser'
import './editUser'
import './authRole2User'
import './authPermission'
import './editIfSendMsg'

//let appId = memoryStore.get('config').appId;

//global variable
memoryStore.set('selectedCollegeId','00000000-0000-0000-0000-000000000000');
memoryStore.set('selectedResourceId','00000000-0000-0000-0000-000000000000');
memoryStore.set('selectedRoleId',null);
memoryStore.set('selectedUserId',null);
memoryStore.set('operatingSchoolId',null);
memoryStore.set('operatingSchoolData',null);
memoryStore.set('SchoolDataSource',null);

//api
//let apiCollection = memoryStore.get('api');
//let userListApi = apiCollection.getUserListByOuId;




//component
let treeLoading = new LoadingContainer('#schoolTreeList',{ size:20,color:ThemeColor["title-h"] });
let eventBus = memoryStore.get('globalEvent');
let userListDataSource = getAdminList().mergeQuery(function () {
    return {
        schoolId: memoryStore.get('selectedSchoolId'),
        collegeId: memoryStore.get('selectedCollegeId')
    }
}).dataSource;


let userGrid = new KendoGrid('#userGrid',{
	columns:[
		{
			field:'id',
			title:'操作',
			template: userOperationTemplate,
			width:100,
			filterable:false
		},
		{
            field:'name',
			title:'姓名',
			width:150
		},
		{
			field:'email',
			title:'邮箱',
			width:200
		},
		{
            field:'mobile',
			title:'手机号码',
			width:180,
			filterable:{
				operators: {
					string: {
						eq: "equal",

					}
				}
			}
        },
        {
            field: 'enabled',
            width: 120,
            title: '启用状态',
            template: function (dataItem) {
                return BooleanTemplate(dataItem.enabled)
            },
            filterable: {
                messages: {
                    isTrue: "是",
                    isFalse: "否"
                }
            }
        },
		{
			field:'creationTime',
            title: '创建时间',
            width: 180,
            format: "{0: yyyy-MM-dd HH:mm:ss}",
            filterable: {
                extra: true,
                ui: "datetimepicker",
                messages: {
                    info: "请选择开始时间和结束时间"
                },
                operators: {
                    date: {
                        gt: "开始时间",
                        lt: "结束时间"
                    }
                },
            }
		},
	],
    dataSource: userListDataSource,
	dataBound:function (e) {
		$('#userGrid').find('.userMenu').kendoMenu({
			select:function (e) {
				let id = e.item.getAttribute('data-id');
				let data = userListDataSource.get(id);
				let action = e.item.getAttribute('data-action');
				memoryStore.set('selectedUserId',id);
                memoryStore.set('selectedUserData', data);
                console.log(action)
				if(action){
					eventBus.trigger(action);
				}
				e.preventDefault()
			}
		});
		$('#userGrid').find('.userMenu').removeClass('hidden');
		//bind button
		$('#userGrid').find('.enableBtn').on('click',function () {
			console.log(this);
			let id = this.getAttribute('data-id');
			let data = userListDataSource.get(id);
			let action = this.getAttribute('data-action');
			memoryStore.set('selectedUserId',id);
			memoryStore.set('selectedUserData',data);
			if(action){
				eventBus.trigger(action);
			}
		})
	}
});
let schoolTree = null;
let schoolDeleteConfirmWindow = new ConfirmWindow('#deleteSchoolWindow', {
    type: 'delete',
    nameField: "schoolName",
    onSubmit: deleteSchool,
    onSuccess: function () {
        eventBus.trigger('refreshSchool')
    },
});
let schoolEnableConfirmWindow = new ConfirmWindow('#enableSchoolWindow', {
    type: 'enable',
    nameField: "schoolName",
    onSubmit: editSchool,
    onSuccess: function () {
        eventBus.trigger('refreshSchool')
    }
});
let schoolDisableConfirmWindow = new ConfirmWindow('#disableSchoolWindow', {
    type: 'disable',
    nameField: "schoolName", 
    onSubmit: editSchool,
    onSuccess: function () {
        eventBus.trigger('refreshSchool')
    }
});
let collegeDeleteConfirmWindow = new ConfirmWindow('#deleteCollegeWindow', {
    type: 'delete',
    nameField: "collegeName",
    onSubmit: deleteCollege,
    onSuccess: function () {
        eventBus.trigger('refreshSchool')
    }
});
let collegeEnableConfirmWindow = new ConfirmWindow('#enableCollegeWindow', {
    type: 'enable',
    nameField: "collegeName",
    onSubmit: editCollege,
    onSuccess: function () {
        eventBus.trigger('refreshSchool')
    }
});
let collegeDisableConfirmWindow = new ConfirmWindow('#disableCollegeWindow', {
    type: 'disable',
    nameField: "collegeName",
    onSubmit: editCollege,
    onSuccess: function () {
        eventBus.trigger('refreshSchool')
    }
});
let userDeleteConfirmWindow = new ConfirmWindow('#deleteUserWindow', {
    type: 'delete',
    onSubmit: deleteUser,
    onSuccess: function () {
        eventBus.trigger('refreshUser')
    }
});
let userEnableConfirmWindow = new ConfirmWindow('#enableUserWindow', {
    type: 'enable',
    onSubmit: enableUser,
    onSuccess: function () {
        eventBus.trigger('refreshUser')
    }
});
let userDisableConfirmWindow = new ConfirmWindow('#disableUserWindow', {
    type: 'disable',
    onSubmit: enableUser,
    onSuccess: function () {
        eventBus.trigger('refreshUser')
    }
});
let resetPasswordConfirmWindow = new ConfirmWindow('#resetPasswordWindow', {
    titleTemplate: function () {
        return `重置用户密码`
    },
    contentTemplate: function (data) {
        return `确认重置用户${data.email}的密码吗?`
    },
    onSuccess: function () {
        eventBus.trigger('refreshUser')
    },
    paramsMap: function (data) {
        return {
            id: data.id
        }
    },
    onSubmit: adminResetPassword
});
async function initTree() {
    if (schoolTree) {
        $('#schoolTreeList').empty();
        schoolTree.destroy();
    }
    console.log(schoolTree)
    treeLoading.start();
    let schoolDataApi = await getSchoolTreeList()
    let schoolDataList = schoolDataApi.dataSource
    let schoolData = schoolDataApi.data;
    memoryStore.set('schoolData', schoolData);
    memoryStore.set('schoolDataSource', schoolDataList);
    treeLoading.stop();
    schoolTree = $('#schoolTreeList').kendoTreeView({
        dataSource: schoolDataList,
        template: schoolTreeItem,
        select: function (e) {
            let node = $(e.node).find('.schoolTreeNode').eq(0);
            let id = node.attr('data-id');
            let type = node.attr('data-type');
			if(type === 'school'){
                memoryStore.set('selectedSchoolId', id);
                memoryStore.set('selectedCollegeId', "");
            } else {
                memoryStore.set('selectedCollegeId', id);
                memoryStore.set('selectedSchoolId', schoolDataList.get(id).schoolId);
			}
			eventBus.trigger('refreshUser');
		},
        dataBound: function (e) {
			//init menu
			$('#schoolTreeList').find('.treeMenu').kendoMenu({
				select:function (e) {
					console.log(e.item);
					let action = e.item.getAttribute('data-action');
					let type = e.item.getAttribute('data-type');
					let id = e.item.getAttribute('data-id');
                    let data = schoolDataList.get(id);
                    if (type === 'school'){
                        memoryStore.set('operatingSchoolId', id);
                        memoryStore.set('operatingCollegeId', "");
						memoryStore.set('operatingSchoolData',data);
                    } else {
                        if (data) {
                            memoryStore.set('operatingSchoolId', data.schoolId);
                        }
						memoryStore.set('operatingCollegeId',id);
						memoryStore.set('operatingCollegeData',data);
                    }
                    memoryStore.set('selectedData', data);
                    if (action) {
                        console.log(action)
						eventBus.trigger(action);
					}
					e.preventDefault()
				}
			});
			$('#schoolTreeList').find('.treeMenuBox').removeClass('hidden');
            //默认选中第一个学校
            //let firstSchool = schoolTree.findByUid(schoolDataList._data[0]['uid'])
            //let firstSchoolId = schoolDataList._data[0]['schoolId']
            //schoolTree.select(firstSchool);
            //memoryStore.set('selectedSchoolId', firstSchoolId);
            //eventBus.trigger('refreshUser');
		}
	}).data('kendoTreeView');
}



$(function () {
    
    eventBus.on(actions.openSchoolDelete, function () {
        schoolDeleteConfirmWindow.open(memoryStore.get('operatingSchoolData'))
    });
    eventBus.on(actions.openSchoolDisable, function () {
        schoolDisableConfirmWindow.open(memoryStore.get('operatingSchoolData'))
    });
    eventBus.on(actions.openSchoolEnable, function () {
        console.log(memoryStore.get('operatingSchoolData'))
        schoolEnableConfirmWindow.open(memoryStore.get('operatingSchoolData'))
    });
    eventBus.on(actions.openCollegeDelete, function () {
        collegeDeleteConfirmWindow.open(memoryStore.get('operatingCollegeData'))
    });
    eventBus.on(actions.openCollegeEnable, function () {
        collegeEnableConfirmWindow.open(memoryStore.get('operatingCollegeData'))
    });
    eventBus.on(actions.openCollegeDisable, function () {
        collegeDisableConfirmWindow.open(memoryStore.get('operatingCollegeData'))
    });
    eventBus.on(actions.openUserDeleteWindow, function () {
        userDeleteConfirmWindow.open(memoryStore.get('selectedUserData'))
    });
    eventBus.on(actions.openUserDisableWindow, function () {
        userDisableConfirmWindow.open(memoryStore.get('selectedUserData'))
    });
    eventBus.on(actions.openUserEnableWindow, function () {
        userEnableConfirmWindow.open(memoryStore.get('selectedUserData'))
    });
    eventBus.on(actions.openResetPsdWindow, function () {
        resetPasswordConfirmWindow.open(memoryStore.get('selectedUserData'))
    });
    //系统管理员模拟账户登录
    eventBus.on(actions.simulateLogin, function () {
        let id = memoryStore.get('selectedUserData').id
        SimulatedSchoolManagement({id:id}).then((data) => {
            store.set('access_token', data.access_token);
            window.location.href = `/admin/ApplicationReview`;
        })
    });
    eventBus.on('refreshUser', function () {
        if (userGrid.instance) {
            userListDataSource.read()
        } else {
            $('.userWrapper').find('.noData').addClass('hidden');
            $('.userWrapper').find('.userGrid').removeClass('hidden');
            $('#addUserBtn').removeClass('hidden');
            userGrid.init()
        }
    });
    eventBus.on('refreshSchool', function () {
        initTree();
    });
    eventBus.on(GlobalEventName.getCurrentUserInfo, function (data) {
        memoryStore.set("currentUserInfo", data)
        //如果是院级管理员则不能有添加学校的按钮
        let currentUserSchoolId = memoryStore.get("currentUserInfo").schoolId;
        if (currentUserSchoolId === Config["systemSchoolId"]) {
            $("#openAddSchoolBtn").show()
        } else {
            $("#openAddSchoolBtn").hide()
        }
        initTree();
    });
    $('#refreshSchoolBtn').on('click', function () {
        initTree();
    });
	

});
