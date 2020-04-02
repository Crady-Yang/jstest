import { KendoWindow } from '../../../component/kendo/window';
import { KendoUploader } from "../../../component/kendo/uploader";
import { actions } from "./actions";

let globalEvent = memoryStore.get('globalEvent');
let uploader = null;
let importWindow = new KendoWindow('#importWindow',{
	title:'导入复试结果',
    open: function () {
        if (!uploader) {
            uploader = new KendoUploader($('#uploadResult'), {
                type: 'uploadResult',
                selectText: '选择文件',
                upload: function (e) {
                    e.data = {
                        SchoolId: memoryStore.get('selectedSchoolId'),
                        CollegeId: memoryStore.get('selectedCollegeId')
                    };
                },
                success: function (e) {
                    let data = e.response.data;
                    console.log(data);
                    importWindow.close()
                },
                error: function (e) {
                    console.log(e);
                }
            })
        }
	}
});

$(function () {

    globalEvent.on(actions.importResult,function () {
		importWindow.open();
	});


});
