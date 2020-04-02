import { KendoWindow } from '../../../component/kendo/window';
import {ImageLoader} from "../../../component/imageLoader";
import {Form} from "../../../component/form";
import {KendoUploader} from "../../../component/kendo/uploader";
import { addSchool } from '../../../controller/rbac/school';
import { ApiCollection } from '../../../common/apiCollection'

let globalEvent = memoryStore.get('globalEvent');
let addSchoolDto = ApiCollection['post/admin/School/Create'].reqDto;

let addSchoolForm = null;
let addSchoolUploader = null;
let addSchoolImageLoader = new ImageLoader($('#addSchoolWindow').find('.portrait'), {
    type: 'portrait'
});
let addSchoolLastContractTime = null;
let addSchoolWindow = new KendoWindow('#addSchoolWindow',{
	title:'添加学校',
    open: function () {
		if(!$('#addSchoolTab').data('kendoTabStrip')){
			$('#addSchoolTab').kendoTabStrip();
		}
        if (!addSchoolForm) {
            console.log(addSchoolDto)
			addSchoolForm = new Form('#addSchoolWindow',{
				dto:addSchoolDto,
				onSubmit:function () {
                    let t = addSchoolForm.getValue();
                    t.portrait = addSchoolImageLoader.path || "00000000-0000-0000-0000-000000000000";
					addSchool(t).then((data)=>{
						addSchoolForm.cancelLoading();
						addSchoolForm.clearForm();
						addSchoolWindow.close();
						globalEvent.trigger('refreshSchool');
					}).catch((error)=>{
						addSchoolForm.cancelLoading();
					})
				}
			});
		}
		if(!addSchoolUploader){
			addSchoolUploader = new KendoUploader($('#addSchoolWindow').find('.uploadPortrait'),{
				type:'publicPicture',
                selectText: '上传学校图标',
                upload: function (e) {
                    e.data = {
                        provider: 1
                    };
                },
				success:function (e) {
					let path = e.response.data;
					addSchoolImageLoader.load(path);
				}
			})
		}
		addSchoolImageLoader.load();
	}
});

$(function () {

	$('#openAddSchoolBtn').on('click',function () {
		addSchoolWindow.open();
	});


});
