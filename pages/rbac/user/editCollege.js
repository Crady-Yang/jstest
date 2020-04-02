import { KendoWindow } from '../../../component/kendo/window';
//import {ImageLoader} from "../../../component/imageLoader";
import {Form} from "../../../component/form";
import { KendoUploader } from "../../../component/kendo/uploader";
import { editCollege, getCollegeDetail} from '../../../controller/rbac/college';
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'

let globalEvent = memoryStore.get('globalEvent');
let editCollegeDto = ApiCollection['post/admin/College/Edit'].reqDto;

let editCollegeForm = null;
//let editCollegeImageLoader = new ImageLoader($('#editCollegeWindow').find('.portrait'),{
//    type:'portrait'
//});
let editCollegeUploader = null;
let eventType = null;
//TODO description 字段 没有返回，/rbac/OU/GetOuListByTId
let editCollegeWindow = new KendoWindow('#editCollegeWindow',{
	title:'编辑学院',
    open: function () {
        let id = memoryStore.get('operatingCollegeId');
        if (!$('#editCollegeTab').data('kendoTabStrip')) {
            $('#editCollegeTab').kendoTabStrip();
        }
        getCollegeDetail({id:id}).then((data) => {
            if (!editCollegeForm) {
                editCollegeForm = new Form('#editCollegeWindow', {
                    dto: editCollegeDto,
                    onSubmit: function () {
                        let t = editCollegeForm.getValue();
                        let id = memoryStore.get('operatingCollegeId')
                        t.id = id;
                        //t.portrait = editCollegeImageLoader.path || "00000000-0000-0000-0000-000000000000";
                        editCollege(t).then((data) => {
                            //clear form + close form
                            editCollegeForm.cancelLoading();
                            editCollegeForm.clearForm();
                            editCollegeWindow.close();
                            globalEvent.trigger('refreshCompany');
                        }).catch((error) => {
                            editCollegeForm.cancelLoading();
                        })
                    }
                });
            }
            //if (!editCollegeUploader) {
            //    editCollegeUploader = new KendoUploader($('#editCollegeWindow').find('.uploadPortrait'), {
            //        type: 'publicPicture',
            //        selectText: '上传学院图标',
            //        upload: function (e) {
            //            e.data = {
            //                provider: 1
            //            };
            //        },
            //        success: function (e) {
            //            let path = e.response.data;
            //            editCollegeImageLoader.load(path);
            //        }
            //    })
            //}
            //editCollegeImageLoader.load();
            //editCollegeImageLoader.img.src = `/${data.collegePortrait}`
            editCollegeForm.setValue(data);
        })
		
	}
});

$(function () {

    globalEvent.on(actions.openCollegeEdit, function () {
		editCollegeWindow.open();
	});

});
