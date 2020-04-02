import { KendoWindow } from '../../../component/kendo/window';
import {ImageLoader} from "../../../component/imageLoader";
import {Form} from "../../../component/form";
import {KendoUploader} from "../../../component/kendo/uploader";
import { editUser } from '../../../controller/user';
import { getCollegeSelectList } from '../../../controller/rbac/college';
import { ApiCollection } from '../../../common/apiCollection';
import { Config } from '../../../common/config';
import {actions} from "./actions";

let globalEvent = memoryStore.get('globalEvent');
let editUserDto = ApiCollection["post/admin/User/Edit"].reqDto;

let editUserForm = null;
let editUserImageLoader = new ImageLoader($('#editUserWindow').find('.portrait'),{
    type:'portrait'
});
let editUserUploader = null;
let editUserBirthday = null;
let editUserCollegeDropDownList = null;
let collegeSelectListDataSource = getCollegeSelectList().mergeQuery(function () {
    return {
        schoolId: memoryStore.get('selectedSchoolId')
    }
}).dataSource;
let systemSchoolId = Config["systemSchoolId"]


let editUserWindow = new KendoWindow('#editUserWindow',{
	title:'编辑用户',
    open: function () {
        let currentCollegeId = memoryStore.get('selectedCollegeId');
        if (currentCollegeId) {
            $('#addUserWindow').find('[for="collegeId"]').addClass("required")
            $('#addUserWindow').find('[name="collegeId"]').attr("required", "required")
        } else {
            $('#addUserWindow').find('[for="collegeId"]').removeClass("required")
            $('#addUserWindow').find('[name="collegeId"]').removeAttr("required")
        }
		let userData = memoryStore.get('selectedUserData');
		if(!editUserForm){
			editUserForm = new Form('#editUserWindow',{
				dto:editUserDto,
                onSubmit: function () {
                    let oldName = userData.name;
					let t = editUserForm.getValue();
                    //let userData = memoryStore.get('selectedUserData');
                    console.log(userData)
                    t.portrait = editUserImageLoader.path || null;
					t.id = userData.id;
                    t.schoolId = memoryStore.get('selectedSchoolId');
                    ////编辑模板接口如果name不修改则传null或不传
                    //if (t.name === oldName) {
                    //    t.name = null
                    //}
					editUser(t).then((data)=>{
						//clear form + close form
						editUserForm.clearForm();
                        editUserWindow.close();
                        editUserForm.cancelLoading();
						globalEvent.trigger('refreshUser');
					}).catch((err)=>{
						editUserForm.cancelLoading();
					})
				}
			});
		}
		if(!editUserUploader){
			editUserUploader = new KendoUploader($('#editUserWindow').find('.uploadPortrait'),{
				type:'publicPicture',
                selectText: '上传头像',
                upload: function (e) {
                    e.data = {
                        provider: 1
                    };
                },
				success:function (e) {
					let path = e.response.data;
					editUserImageLoader.load(path);
				}
			})
        }
        editUserImageLoader.load(); 
        editUserImageLoader.img.src = `/${userData.portrait}`
        // 学院下拉框
        if (!editUserCollegeDropDownList) {
            editUserCollegeDropDownList = $('#editUserWindow').find('[name="collegeId"]').kendoDropDownList({
                dataSource: collegeSelectListDataSource,
                dataTextField: "name",
                dataValueField: "id",
                optionLabel: "请选择学院",
            }).data('kendoDropDownList');
        }
        if (!editUserBirthday) {
            editUserBirthday = $('#editUserWindow').find('[name="birthday"]').kendoDatePicker({
                format: 'yyyy-MM-dd'
            })
        }
		editUserForm.setValue(userData);
	}
});

$(function () {

    globalEvent.on(actions.openUserEditWindow,function () {
		editUserWindow.open();
	});


});
