import { KendoWindow } from '../../../component/kendo/window';
//import {ImageLoader} from "../../../component/imageLoader";
import {Form} from "../../../component/form";
import { KendoUploader } from "../../../component/kendo/uploader";
import { addCollege } from '../../../controller/rbac/college';
import { ApiCollection } from '../../../common/apiCollection'
import {actions} from "./actions";

let globalEvent = memoryStore.get('globalEvent');
let apiCollection = memoryStore.get('api');
let addCollegeDto = ApiCollection["post/admin/College/Create"].reqDto;

let addCollegeForm = null;
//let addCollegeImageLoader = new ImageLoader($('#addCollegeWindow').find('.portrait'),{
//    type:'portrait'
//});
let addCollegeUploader = null;
let eventType = null;
let addCollegeWindow = new KendoWindow('#addCollegeWindow',{
	title:'添加学院',
    open: function () {
        if (!$('#addCollegeTab').data('kendoTabStrip')) {
            $('#addCollegeTab').kendoTabStrip();
        }
		if(!addCollegeForm){
            addCollegeForm = new Form('#addCollegeWindow',{
				dto:addCollegeDto,
				onSubmit:function () {
					let t = addCollegeForm.getValue();
					// 添加学校下的学院
                    let data = memoryStore.get('operatingSchoolData');
                    //t.parentId = '00000000-0000-0000-0000-000000000000';
                    console.log(data)
                    t.schoolId = data.id;
                    //t.portrait = addCollegeImageLoader.path || "00000000-0000-0000-0000-000000000000";
					addCollege(t).then((data)=>{
						//clear form + close form
						addCollegeForm.cancelLoading();
						addCollegeForm.clearForm();
						addCollegeWindow.close();
						globalEvent.trigger('refreshSchool');
					}).catch((error)=>{
						addCollegeForm.cancelLoading();
					})
				}
			});
		}
		//if(!addCollegeUploader){
		//	addCollegeUploader = new KendoUploader($('#addCollegeWindow').find('.uploadPortrait'),{
		//		type:'publicPicture',
  //              selectText: '上传学院图标',
  //              upload: function (e) {
  //                  e.data = {
  //                      provider: 1
  //                  };
  //              },
		//		success:function (e) {
		//			let path = e.response.data;
		//			addCollegeImageLoader.load(path);
		//		}
		//	})
		//}
		//addCollegeImageLoader.load();
	}
});

$(function () {

    globalEvent.on(actions.openSchoolAddCollege, function () {
		addCollegeWindow.open();
	})


});
