import { BaseComponent } from '../baseComponent'
import { KendoGrid } from '../kendo/grid'
import { LoadingContainer } from '../loadingContainer'
import { PermitTypeObjectInstance } from '../../objectValue/rbac/permitType'
import { PermissionTargetTypeObjectInstance } from '../../objectValue/rbac/permissionTargetType'
import { ResourceTypeObjectInstance } from '../../objectValue/rbac/resourceType'
import { getTargetPermission, authPermission2User } from '../../controller/user'
import { getRolePermission, authPermission2Role } from '../../controller/rbac/role'

export class AuthPermissionGrid extends BaseComponent{

	/**
	 * AuthPermissionGrid constructor
	 * 先获取user/role的已有权限，再读取Permission Resource的list
	 * @param el
	 * @param opt.type 给角色授权还是给用户授权
	 * @param opt.id
	 * @param opt.companyId
	 */
	constructor(el,opt){
		super(el,opt);
		this.type = opt.type;
		this.id = null;
		this.targetData = null;
        this.gridInstance = null;
        this.actionInstance = PermitTypeObjectInstance.toObjectArray();
		this.appSelectorInstance = null;
		this.event = new EventEmitter();
		this.authLoading = null;
        this.removeLoading = null;
        this.resourceDataSource = null;
        this.apiFunc = function () { }//根据不同的type调不同的接口
        this.apiIdKey=""//接口发过去的参数，type为role参数为roleId，user则为userId
        if (this.type === "user") {
            this.apiFunc = function (data) {
                authPermission2User(data).then((data) => {
                    this.authLoading.stop();
                    this.resourceDataSource.read();
                }).catch((err) => {
                    this.authLoading.stop();
                })
            }
            this.apiIdKey="userId"
        }
        if (this.type === "role") {
            this.apiFunc = function (data) {
                authPermission2Role(data).then((data) => {
                    this.authLoading.stop();
                    this.resourceDataSource.read();
                }).catch((err) => {
                    this.authLoading.stop();
                })
            }
            this.apiIdKey = "roleId"
        }
	}

	initDom(){
		//let appDom = this.type === 'role' ? '<input class="applicationSelector" />':'';
		this.$el.empty().append(`
		<div class="clearfix">
			<button disabled class="updateBtn k-button k-icon-button editBtn pull-left">禁用权限</button>
			 <button disabled class="authBtn k-button k-icon-button addIconBtn pull-left" style="margin: 0px 10px">允许访问</button>
			 <button disabled class="removeBtn k-button k-icon-button deleteBtn pull-left">清除权限</button>
			
		</div>
		<div class="gridWrapper" style="margin: 10px 0px; min-height: 500px">
			<div class="grid"></div>	
		</div>
		`);
		//this.$action = this.$el.find('.action');
		this.$authBtn = this.$el.find('.authBtn');
        this.$removeBtn = this.$el.find('.removeBtn');
        this.$updateBtn = this.$el.find('.updateBtn');
		this.$grid = this.$el.find('.grid');
		this.$gridWrapper = this.$el.find('.gridWrapper');
		this.$button = this.$el.find('.submitBtn');
		//this.applicationDataSource = getApplicationDataSource().dataSource;
	}

	//initTargetData(){
	//	let that = this;
	//	return getTargetPermission({
	//		"userId": that.id
	//	}).then((data)=>{
	//		that.targetData = data;
	//	})
	//}

	// abandon
	// initApplication(cb){
	// 	let that = this;
	// 	this.appSelectorInstance = this.$appSelector.kendoDropDownList({
	// 		dataSource:that.applicationDataSource,
	// 		dataTextField:'name',
	// 		dataValueField:'id',
	// 		dataBound:function () {
	// 			that.appId = that.applicationDataSource.data()[0].id;
	// 			cb();
	// 		},
	// 		change:function () {
	// 			that.appId = that.applicationDataSource.data()[0].id;
	// 			that.initTargetData().then(()=>{
	// 				that.resourceDataSource.read()
	// 			})
	// 		}
	// 	}).data('kendoDropDownList')
	// }

	initGrid(){
        let that = this;
        console.log(that.id)
        if (this.type === "user") {
            this.resourceDataSource = getTargetPermission().mergeQuery(function () {
                return {
                    "userId": that.id
                }
            }).dataSource;
        }
        if (this.type === "role") {
            this.resourceDataSource = getRolePermission().mergeQuery(function () {
                return {
                    "roleId": that.id
                }
            }).dataSource;
        }
		this.gridInstance = new KendoGrid(that.$grid,{
            dataSource: that.resourceDataSource,
			columns:[
				// { field:'id',title:'Action',template:function (data) {
				// 		return `<input data-id="${data.id}" class="hidden gridSelector" />`
				// 	}},
				{ selectable:true, width:80 },
				{
					field:'action',
					title:'Permit',
                    template: function (data) {
                        return PermitTypeObjectInstance.getByValue(data.action, 'id').value
                    },
                    filterable: {
                        ui: function (element) {
                            element.kendoDropDownList({
                                dataSource: PermitTypeObjectInstance.toObjectArray(),
                                dataTextField: "value",
                                dataValueField: "id"
                            })
                        }
                    }

				},
				{ field:'name',title:'Name',filterable: false },
				{ field:'url',title:'Url' },
				{
					field:'resourceType',
					title:'resourceType',
					template:function (data) {
						return ResourceTypeObjectInstance.getByValue(data.resourceType,'id').value
					},
					filterable: {
						ui: function (element) {
							element.kendoDropDownList({
								dataSource: ResourceTypeObjectInstance.toObjectArray(),
								dataTextField: "value",
								dataValueField: "id"
							})
						}
					}
				},
			],
			dto:null,
			change:function(){
				let s = this.select();
				console.log(s)
				if(s.length === 0){
					that.$authBtn.attr('disabled','disabled');
                    that.$removeBtn.attr('disabled', 'disabled');
                    that.$updateBtn.attr('disabled', 'disabled');
				}else {
					that.$authBtn.removeAttr('disabled');
                    that.$removeBtn.removeAttr('disabled');
                    that.$updateBtn.removeAttr('disabled')
				}
			}
		});
		this.gridInstance.init();
	}
    
	getChangeData() {
		let that = this;
		let kendoGrid = that.gridInstance.instance;
        let selected = kendoGrid.select();
		let selectedData = [];
		for(let i=0;i<selected.length;i++){
			let t = selected[i];
			let tt = kendoGrid.dataItem(selected.eq(i));
			selectedData.push(tt);
		}
		let add = [];
        let update = [];
        let userId = ""


		for(let i=0;i<selectedData.length;i++){
			let t = selectedData[i];
            let thisAction = t.action;
            console.log(thisAction)
            //加权限
            if (thisAction === PermitTypeObjectInstance.getByValue("noAssign", 'key').id){
				add.push({
					"resourceId": t.id,
                    "action": PermitTypeObjectInstance.getByValue("allow", 'key').id
				})
			}
            //禁用权限
            if (thisAction === PermitTypeObjectInstance.getByValue("allow", 'key').id) {
                update.push({
                    "resourceId": t.id,
                    "action": PermitTypeObjectInstance.getByValue("forbidden", 'key').id
                })
            }
            //启用权限
            if (thisAction === PermitTypeObjectInstance.getByValue("forbidden", 'key').id) {
                update.push({
                    "resourceId": t.id,
                    "action": PermitTypeObjectInstance.getByValue("allow", 'key').id
                })
            }
		}
        if (that.type === "user") {
            userId = that.id
        }
        if (that.type === "role") {
            userId = that.id
        }
        return {
            [that.apiIdKey]: userId,
            add: add,
            edit: update
		}
	}
    initUpdateAuthBtn() {
        let that = this;
        this.$updateBtn.on('click', function () {
            that.authLoading.start();
            let data = that.getChangeData();
            console.log('------ initAuthBtn --------');
            console.log(data)
            data.add = []
            data.delete = []

            if (data.edit.length) {
                that.apiFunc(data)
                //authPermission2User(data).then((data) => {
                //    that.authLoading.stop();
                //    that.resourceDataSource.read();
                //}).catch((err) => {
                //    that.authLoading.stop();
                //})
            } else {
                alert("没有要禁用的权限！")
            }

        })
    }
	initAuthBtn(){
		let that = this;
		this.$authBtn.on('click',function () {
			that.authLoading.start();
			let data = that.getChangeData();
            console.log('------ initAuthBtn --------');
            console.log(data)
            data.edit = []
            data.delete=[]
            
            if (data.add.length) {
                that.apiFunc(data)
            } else {
                alert("权限已添加！")
            }
			
		})
	}

	initRemoveBtn(){
		let that = this;
		this.$removeBtn.on('click',function () {
			that.removeLoading.start();
			let kendoGrid = that.gridInstance.instance;
			let selectedData = [];
            let selected = kendoGrid.select();
            let userId="";
			for(let i=0;i<selected.length;i++){
				let t = kendoGrid.dataItem(selected.eq(i));
				selectedData.push(t.id);
            }
            let pramData = {
                [that.apiIdKey]: that.id,
                add: [],
                edit: [],
                'delete': selectedData
            }
            that.apiFunc(pramData)
		})
	}

	initActionSelector(){
		 this.actionInstance = this.$action.kendoDropDownList({
			dataSource:PermitTypeObjectInstance.toObjectArray(),
			dataTextField:'value',
			dataValueField:'id'
		}).data('kendoDropDownList')
	}



	init(data){
		let that = this;
		that.id = data.id;
		that.initDom();
		//.initActionSelector();
		that.authLoading = new LoadingContainer(that.$authBtn);
		that.removeLoading = new LoadingContainer(that.$removeBtn);
		//that.initTargetData().then(()=>{
		//	that.initGrid();
		//});
        that.initGrid()
		that.initAuthBtn();
        that.initRemoveBtn();
        that.initUpdateAuthBtn();
	}
}
