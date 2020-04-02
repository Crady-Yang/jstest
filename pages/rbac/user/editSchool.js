import { KendoWindow } from '../../../component/kendo/window';
import {ImageLoader} from "../../../component/imageLoader";
import {Form} from "../../../component/form";
import {KendoUploader} from "../../../component/kendo/uploader";
import { editSchool, getSchoolDetail} from '../../../controller/rbac/school';
import { actions } from './actions'
import { ApiCollection } from '../../../common/apiCollection'

let globalEvent = memoryStore.get('globalEvent');
let editSchoolDto = ApiCollection['post/admin/School/Edit'].reqDto;

let editSchoolForm = null;
let editSchoolImageLoader = new ImageLoader($('#editSchoolWindow').find('.portrait'),{
    type:'portrait'
});
let editSchoolUploader = null;
let editSchoolWindow = new KendoWindow('#editSchoolWindow',{
	title:'编辑学校',
    open: function () {
        let schoolData = memoryStore.get('operatingSchoolData');
		if(!$('#editSchoolTab').data('kendoTabStrip')){
			$('#editSchoolTab').kendoTabStrip();
        }
        getSchoolDetail({ id: schoolData["id"] }).then((schoolDetailData) => {
            if (!editSchoolForm) {
                editSchoolForm = new Form('#editSchoolWindow', {
                    dto: editSchoolDto,
                    onSubmit: function () {
                        let t = editSchoolForm.getValue();
                        let schoolData = memoryStore.get('operatingSchoolData');
                        t.id = schoolData.id;
                        t.portrait = editSchoolImageLoader.path || null;
                        editSchool(t).then((data) => {
                            //clear form + close form
                            editSchoolForm.clearForm();
                            editSchoolForm.cancelLoading();
                            editSchoolWindow.close();
                            globalEvent.trigger('refreshSchool');
                        }).catch((err) => {
                            editSchoolForm.cancelLoading();
                        })
                    }
                });
            }
            if (!editSchoolUploader) {
                editSchoolUploader = new KendoUploader($('#editSchoolWindow').find('.uploadPortrait'), {
                    type: 'publicPicture',
                    selectText: '上传学校图标',
                    upload: function (e) {
                        e.data = {
                            provider: 1
                        };
                    },
                    success: function (e) {
                        let path = e.response.data;
                        editSchoolImageLoader.load(path);
                    }
                })
            }
            //全部初始化结束之后 赋值
            editSchoolForm.setValue(schoolDetailData);
        })
        editSchoolImageLoader.load();
        editSchoolImageLoader.img.src = `/${schoolData.schoolPortrait}`
		
        
	}
});

$(function () {
    globalEvent.on(actions.openSchoolEdit, function () {
		editSchoolWindow.open();
	})


});
