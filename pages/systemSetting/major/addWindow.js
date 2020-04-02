import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection'
import { getCourseSelectList } from '../../../controller/systemSetting/course'
import { addMajor } from '../../../controller/systemSetting/major'
import { MajorTypeObjectInstance } from '../../../objectValue/systemSetting/majorType'
import { StudyTypeObjectInstance } from '../../../objectValue/systemSetting/studyType'

let globalEvent = memoryStore.get('globalEvent');
let addDto = ApiCollection['post/admin/Major/Create'].reqDto;

let addForm = null;
let majorTypeDataSource = MajorTypeObjectInstance.toObjectArray()
let majorTypeDropdownList = null;
let studyTypeDataSource = StudyTypeObjectInstance.toObjectArray()
let studyTypeDropdownList = null;
let courseSelectList = null;


function majorTypeDropdownInit() {
    if (!majorTypeDropdownList) {
        majorTypeDropdownList = $("#addWindow").find('[name="majorType"]').kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: majorTypeDataSource,
            index: 0,
        })
    }
}
function studyTypeDropdownInit() {
    if (!studyTypeDropdownList) {
        studyTypeDropdownList = $("#addWindow").find('[name="studyType"]').kendoDropDownList({
            dataTextField: "value",
            dataValueField: "id",
            dataSource: studyTypeDataSource,
            index: 0,
        })
    }
}
function courseSelectInit() {
    let datasource = getCourseSelectList().mergeQuery(function () {
        return {
            page: 1,
            pageSize: 100000,
            schoolId: memoryStore.get('selectedSchoolId'),
            collegeId: memoryStore.get('selectedCollegeId')
        }
    }).dataSource;
    if (!courseSelectList) {
        courseSelectList = $("#addWindow").find('[name="courseIds"]').kendoMultiSelect({
            dataSource: datasource,
            dataTextField: "name",
            dataValueField: "id",
            placeholder: "请选择...",
            filter: "contains",
            change: function () {
            },
            deselect: function (e) {
            },
        }).data("kendoMultiSelect")
    } else {
        //datasource.read();
        courseSelectList.setDataSource(datasource);
    }
}
let addWindow = new KendoWindow('#addWindow',{
	title:'添加专业',
    open: function () {
        majorTypeDropdownInit();
        studyTypeDropdownInit();
        courseSelectInit();
		if(!addForm){
			addForm = new Form('#addWindow',{
				dto:addDto,
				onSubmit:function () {
					let t = addForm.getValue();
                    t.schoolId = memoryStore.get('selectedSchoolId');
                    t.collegeId = memoryStore.get('selectedCollegeId');
                    t.majorType = parseInt(t.majorType);
                    addMajor(t).then((data)=>{
						//clear form + close form
						addForm.cancelLoading();
						addForm.clearForm();
						addWindow.close();
						globalEvent.trigger(actions.refresh);
					}).catch((error)=>{
						addForm.cancelLoading();
					})
				}
			});
		}
	}
});

$(function () {

	$('#addBtn').on('click',function () {
		addWindow.open();
	});


});
