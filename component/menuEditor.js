import { BaseComponent } from './baseComponent'
import {createGuid, formatTreeData,collect_merge} from "../common/utils";
import {addUserMenu, deleteUserMenu, editUserMenu,optCustomMenu } from "../controller/customMenu";
import {CustomMenuTypeInstance} from "../objectValue/common/customMenuType";
import {getFolderNewId, getFolderTree} from "../pages/header/helper";
import {LoadingContainer} from "./loadingContainer";
import { Notification } from './notification'


export class MenuEditor extends BaseComponent{
	constructor(el,opt){
		super(el,opt);
		opt = opt || {};
		this.tree = null;
		this.dragend = opt.dragend;
		this.$tree = null;
		this.$addFolderBtn = null;
		this.$saveBtn = null;
		this.treeOption = opt.treeOption || {};
		this.refresh_p = opt.refresh_p;  //触发刷新的promise，返回init的data参数
		this.data = null;
		this.saveLoading = null;
		// 存储本地变化的数据
		this.updateData = {};
		this.removedData = {};

		this._initDom();
		this.bindAddFolder();
		this.bindSaveBtn();
	}

	_initDom(){
		this.$el.empty().append(`
			<button class="saveMenuBtn k-button k-primary pull-right">save</button>
			<button class="addRootBtn k-button k-icon-button addIconBtn pull-right">Add Root Folder</button>
			<div class="menuTree"></div>
		`);
		this.$tree = this.$el.find('.menuTree');
		this.$addFolderBtn = this.$el.find('.addRootBtn');
		this.$saveBtn = this.$el.find('.saveMenuBtn');
	}
	
	bindSaveBtn(){
		let that = this;
		this.$saveBtn.off('click').on('click',function () {
			if(!that.saveLoading){
				that.saveLoading = new LoadingContainer('',{ ifButton:true });
			}
			that.saveLoading.start();
			let changedData = that._getChangedData();
			if((changedData.add.length + changedData.update.length + changedData.delete.length) === 0){
				Notification.show('Nothing to update','warning');
				return;
			}
			optCustomMenu(changedData).then((data)=>{
				that.updateData = {};
				that.removedData = {};
				that.saveLoading.stop();
				that.refresh_p().then((data)=>{
					that.init(data)
				});
				that.$addFolderBtn.removeAttr('disabled');
			}).catch((err)=>{
				that.saveLoading.stop();
			});

		})
	}

	bindAddFolder(){
		let that = this;
		this.$addFolderBtn.off('click').on('click',function () {
			that.$addFolderBtn.attr('disabled','disabled');
			//let $selected = that.tree.select();
			let parentId = '00000000-0000-0000-0000-000000000000';
			// if($selected.length){
			// 	let uid = $selected.attr('data-uid');
			// 	parentId = that.tree.dataSource.getByUid(uid).id;
			// }
			let newId = createGuid();
			that.data.push({ title:'new folder',id:newId, parentId:parentId,itemType:'new' });
			that.init(that.data);
		})
	}

	_getIdByLiDom($li){
		return  $li.children('.k-bot').children('.k-in').find('.submitBtn').attr('data-id');
	}

	_getParentIdByUid(uid){
		let thisDom = this.tree.findByUid(uid);
		let parent = this.tree.parent(thisDom);
		return this._getIdByLiDom(parent)
	}

	// 修改删除的时候，维护本地数据
	_updateLocalData(type,data){
		let id = data.id || data;
		if(type === 'update'){
			this.updateData[id] = data;
		}
		if(type === 'remove'){
			this.removedData[id] = true;
		}
	}

	// 获取调整顺序的修改和新增数据
	_getUpdatedData(){
		let currentData = this.tree.dataSource.data();
		let update = [];
		let add = [];
		console.log('-------- _getUpdatedData -------');
		console.log(currentData);
		//let parentId = '00000000-0000-0000-0000-000000000000';
		// index 代表当前dom的位置
		function loop(list,parentId) {
			for(let i=0;i<list.length;i++){
				console.log(' -------- 1 --------');
				console.log(list[i]);
				if(list[i].dataType === 'new'){
					add.push(list[i])
				}else {
					if(list[i].sort !== i || list[i].parentId !== parentId){
						update.push({ id:list[i].id,sort:i, parentId:parentId});
					}
				}
				if(list[i].hasChildren && list[i].items){
					loop(list[i].items,list[i].id)
				}
			}
		}

		loop(currentData,'00000000-0000-0000-0000-000000000000');

		return {
			update,
			add
		};
	}


	_getChangedData(){
		let data = this._getUpdatedData();
		let removeData = Object.keys(this.removedData);
		let updateData = [];
		for(let k in this.updateData){
			updateData.push(this.updateData[k])
		}
		let update1 = data.update.map((v)=>{
			return v.id;
		});
		let update2 = updateData.map((v)=>{
			return v.id;
		});
		let finalUpdateId = _.union(update1,update2);
		let finalUpdate = finalUpdateId.map((v)=>{
			let d1 = _.filter(data.update,{ id:v })[0] || {};
			let d2 = _.filter(updateData,{ id:v })[0] || {};
			return Object.assign({},d1,d2)
		});


		let finalAdd = data.add.map((v)=>{
			let title = v.title;
			return Object.assign(v,{
					name: title,
					sort:0,
					menuId:0,
					type:CustomMenuTypeInstance.get('nav').id
			})
		});
		let finalRemove = removeData.map((v)=>{
			return { id:v }
		});
		return {
			add:finalAdd,
			update:finalUpdate,
			"delete":finalRemove
		}
	}



	init(data){
		let folderData = data;
		this.data = data;
		let that = this;
		folderData = folderData.map((v)=>{
			v.url = null;
			return v
		});
		folderData = formatTreeData(folderData,{ newKey:'items' });
		let dataSource = new kendo.data.HierarchicalDataSource({
			data:folderData,
			schema: {
				model: {
					id: "id",
					hasChildren: function (item) {
						return item.items && item.items.length > 0
					},
					children: "items"
				},
			}
		});

		if(!this.tree){
			//$('#addCustomNavWindow').find('.customMenuTree')
			let option = Object.assign({
				dataSource:dataSource,
				dataTextField: "title",
				dataValueField: "id",
				dragAndDrop: true,
				dragend(e){

					console.log("Drag end", e.sourceNode, e.dropPosition, e.destinationNode);

					// let updated = that._getUpdatedData();
					// editUserMenu(updated).then((data)=>{
					// 	that.refresh_p().then((data)=>{
					// 		that.init(data)
					// 	});
					// 	that.$addFolderBtn.removeAttr('disabled');
					// })
				},
				template:function (dataItem) {
					dataItem = dataItem.item;
					let hidden1 = '';
					let hidden2 = 'hidden';
					let itemType = 'old';
					let newOldStatus = 'detailStatus';
					let addSubBtn = `<span style="display: none" class="pull-left k-button k-button-xs optBtn addSubBtn ${hidden1}" data-type="${itemType}" data-id="${dataItem.id}"><i class="fas fa-folder-plus"></i></span>`;
					if(dataItem.itemType === 'new'){
						hidden1 = 'hidden';
						hidden2 = '';
						itemType = 'new';
						newOldStatus = 'editStatus';
						addSubBtn = '';
					}

					let removeBtn = dataItem.hasChildren ? '':`<span style="display: none" class="pull-left k-button k-button-xs optBtn removeBtn ${hidden1}" data-type="${itemType}" data-id="${dataItem.id}"><i class="far fa-trash-alt"></i></span>`;
					let btnDom = dataItem.ifDefaultShow ? '':
						`<span style="display: none" class="pull-left k-button k-button-xs optBtn editBtn ${hidden1}" data-type="${itemType}" data-id="${dataItem.id}"><i class="far fa-edit"></i></span>
					 ${removeBtn}
					 ${addSubBtn}
					 <span class="pull-left k-button k-button-xs submitBtn ${hidden2}" data-uid="${dataItem.uid}" data-type="${itemType}" data-id="${dataItem.id}"><i class="fas fa-check"></i></span>
					 <span class="pull-left k-button k-button-xs cancelBtn ${hidden2}" data-uid="${dataItem.uid}" data-type="${itemType}" data-id="${dataItem.id}"><i class="fas fa-times"></i></span>
					 `;
					return `<div class="treeItem">
											<span class="text pull-left" style="height: 24px;line-height: 24px;padding-right: 10px">
								        <span class="folder ${hidden1}" data-id="${dataItem.id}">${dataItem.title }</span>
								        <input class="editInput ${hidden2}" data-id="${dataItem.id}" value="${dataItem.title }"/>
								      </span>
								      <span class="itemOptBox ${newOldStatus}">
								      	${btnDom}
											</span>
										</div>
						`
				},
				dataBound:function () {

					//默认选中root
					let treeInstance = this;
					let data = dataSource.data();
					let $tree = that.$tree;
					this.select($tree.find('[data-root]'));
					//hover事件
					$tree.find('.treeItem').hover(function () {
						$(this).find('.detailStatus').find('.optBtn').show().removeClass('hidden-i');
					},function () {
						$(this).find('.detailStatus').find('.optBtn').hide().addClass('hidden-i')
					});
					//绑定编辑和删除事件
					$tree.find('.editBtn').off('click').on('click',function () {
						let $p = $(this).parent().parent('.treeItem');
						let $itemBox = $(this).parent('.itemOptBox');
						let $textBox = $p.children('.text');
						let text = $textBox.children('.folder').text();
						$itemBox.removeClass('detailStatus').addClass('editStatus');
						$textBox.children('.folder').addClass('hidden');
						$textBox.children('.editInput').removeClass('hidden').val(text);
						$itemBox.children('.editBtn').addClass('hidden-i');
						$itemBox.children('.removeBtn').addClass('hidden-i');
						$itemBox.children('.addSubBtn').addClass('hidden-i');
						$itemBox.children('.submitBtn').removeClass('hidden');
						$itemBox.children('.cancelBtn').removeClass('hidden');
					});
					$tree.find('.removeBtn').off('click').on('click',function () {
						let id = $(this).attr('data-id');
						//let data = dataSource.get(id);
						// deleteUserMenu({ id }).then((data)=>{
						// 	that.refresh_p().then((data)=>{
						// 		that.init(data)
						// 	})
						// })
						that._updateLocalData('remove',id);
						// that.removedData.push(id);
						// console.log($(this).parents('.k-item[role=treeitem]').eq(0));
						treeInstance.remove($(this).parents('.k-item[role=treeitem]').eq(0))
					});
					$tree.find('.addSubBtn').off('click').on('click',function () {
						let id = $(this).attr('data-id');
						let newId = createGuid();
						let newItem = { title:'new folder',id:newId, parentId:id,itemType:'new' };
						// that.data.push({ title:'new folder',id:newId, parentId:id,itemType:'new' });
						// that.init(that.data);
						treeInstance.append(newItem,$(this).parents('.k-item[role=treeitem]').eq(0));
						console.log(treeInstance.dataSource.data());
					});
					$tree.find('.submitBtn').off('click').on('click',function () {
						let uid = $(this).attr('data-uid');
						let $p = $(this).parent().parent('.treeItem');
						let id = $(this).attr('data-id');
						let itemType = $(this).attr('data-type');
						let title = $p.find('.editInput').val();
						let thisDom = that.tree.findByUid(uid);
						let parent = that.tree.parent(thisDom);
						let parentId = parent.children().first().children('.k-in').find('.submitBtn').attr('data-id');
						console.log(thisDom);
						console.log(parent);
						let orgNode = $(this).parents('.k-item[role=treeitem]').eq(0);
						if(itemType === 'new'){
							// 删除原来的，添加新的Node

							let parentNode = treeInstance.parent(orgNode);
							treeInstance.remove(orgNode);
							// dataType:new 在保存的时候作为添加的数据提交
							treeInstance.append({ id:id,title:title,parentId:parentId,dataType:'new' },parentNode);
							// addUserMenu({
							// 	title,
							// 	name: title,
							// 	parentId:parentId,
							// 	sort:0,
							// 	menuId:0,
							// 	type:CustomMenuTypeInstance.get('nav').id
							// }).then(()=>{
							// 	that.refresh_p().then((data)=>{
							// 		that.init(data)
							// 	});
							// 	that.$addFolderBtn.removeAttr('disabled');
							// })
						}else {
							that._updateLocalData('update',{ id,title,parentId });
							treeInstance.text(orgNode,title);
							// editUserMenu({
							// 	id,
							// 	title,
							// 	parentId
							// }).then((data)=>{
							// 	that.refresh_p().then((data)=>{
							// 		that.init(data)
							// 	});
							// 	that.$addFolderBtn.removeAttr('disabled');
							// })
						}
					});
					$tree.find('.cancelBtn').off('click').on('click',function () {
						let type = $(this).attr('data-type');
						let $p = $(this).parent().parent('.treeItem');
						let $itemBox = $(this).parent('.itemOptBox');
						let $textBox = $p.children('.text');
						let id = $(this).attr('data-id');
						$itemBox.removeClass('editStatus').addClass('detailStatus');
						if(type === 'old'){
							$textBox.children('.folder').removeClass('hidden');
							$textBox.children('.editInput').addClass('hidden');
							$itemBox.children('.editBtn').removeClass('hidden');
							$itemBox.children('.removeBtn').removeClass('hidden');
							$itemBox.children('.addSubBtn').removeClass('hidden');
							$itemBox.children('.submitBtn').addClass('hidden');
							$itemBox.children('.cancelBtn').addClass('hidden');
						}else {
							let orgData = memoryStore.get('folderData');
							let newData = _.differenceBy(orgData,[{ id:id }],'id');
							that.data = newData;
							that.init(newData);
							that.$addFolderBtn.removeAttr('disabled');
						}
					})
				}
			},that.treeOption);
			this.tree = this.$tree.kendoTreeView(option).data('kendoTreeView');
			this.tree.expand(that.$tree.find('.k-item'));
		}else {
			this.tree.setDataSource(dataSource);
			this.tree.expand(that.$tree.find('.k-item'));
		}
	}
}
