import { KendoWindow } from '../../../component/kendo/window';
import {ImageLoader} from "../../../component/imageLoader";
import {Form} from "../../../component/form";
import {KendoUploader} from "../../../component/kendo/uploader";
import { addUser } from '../../../controller/user';
import { getCollegeSelectList} from '../../../controller/rbac/college';
import { ApiCollection } from '../../../common/apiCollection'
import { Config } from '../../../common/config';


let globalEvent = memoryStore.get('globalEvent');
let addUserDto = ApiCollection["post/admin/User/Create"].reqDto;
let userDataSource = null;

let addUserForm = null;
let addUserImageLoader = new ImageLoader($('#addUserWindow').find('.portrait'),{
    type:'portrait'
});
let addUserUploader = null;
let addUserCollegeDropDownList = null;
let addUserBirthday = null;
let collegeSelectListDataSource = getCollegeSelectList().mergeQuery(function () {
    return {
        schoolId: memoryStore.get('selectedSchoolId')
    }
}).dataSource;
//let systemSchoolId = Config["systemSchoolId"]


let addUserWindow = new KendoWindow('#addUserWindow',{
	title:'添加用户',
    open: function () {
        //添加校级用户的时候学院可不必填
        //let currentUserSchoolId = memoryStore.get("selectedSchoolId")
        let currentCollegeId = memoryStore.get('selectedCollegeId');
        if (currentCollegeId) {
            $('#addUserWindow').find('[for="collegeId"]').addClass("required")
            $('#addUserWindow').find('[name="collegeId"]').attr("required", "required")
        } else {
            $('#addUserWindow').find('[for="collegeId"]').removeClass("required")
            $('#addUserWindow').find('[name="collegeId"]').removeAttr("required")
        }
        if (!addUserForm) {
            addUserForm = new Form('#addUserWindow', {
                dto: addUserDto,
                onSubmit: function () {
                    let t = addUserForm.getValue();
                    t.portrait = addUserImageLoader.path || "00000000-0000-0000-0000-000000000000";
                    t.schoolId = memoryStore.get('selectedSchoolId');
                    t.collegeId = addUserCollegeDropDownList.value() ? addUserCollegeDropDownList.value() :"00000000-0000-0000-0000-000000000000";
                    t.birthday = t.birthday ? t.birthday:null
                    addUser(t).then((data) => {
                        //clear form + close form
                        addUserForm.clearForm();
                        addUserWindow.close();
                        addUserForm.cancelLoading();
                        globalEvent.trigger('refreshUser');
                    }).catch((err) => {
                        addUserForm.cancelLoading();
                    })
                }
            });
        }
        // 学院下拉框
        if (!addUserCollegeDropDownList) {
            addUserCollegeDropDownList = $('#addUserWindow').find('[name="collegeId"]').kendoDropDownList({
                dataSource: collegeSelectListDataSource,
                dataTextField: "name",
                dataValueField: "id",
                optionLabel: "请选择学院",
                dataBound: function () {
                    addUserCollegeDropDownList.value(memoryStore.get('selectedCollegeId'))
                }
            }).data('kendoDropDownList');
        } else {
            collegeSelectListDataSource.read();

        }
		
		if(!addUserUploader){
			addUserUploader = new KendoUploader($('#addUserWindow').find('.uploadPortrait'),{
				type:'publicPicture',
                selectText: '上传头像',
                upload: function (e) {
                    e.data = {
                        provider:1
                    };
                },
                success: function (e) {
                    let path = e.response.data;
					addUserImageLoader.load(path);
				}
			})
        }
        if (!addUserBirthday) {
            addUserBirthday = $('#addUserWindow').find('[name="birthday"]').kendoDatePicker({
                format: 'yyyy-MM-dd'
            })
        }
        addUserCollegeDropDownList.value(memoryStore.get('selectedCollegeId'))
		addUserImageLoader.load();
		
		
	}
});

$(function () {

	$('#addUserBtn').on('click',function () {
		addUserWindow.open();
	});


});
