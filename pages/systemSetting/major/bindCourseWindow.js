import { KendoWindow } from '../../../component/kendo/window';
import { Form } from "../../../component/form";
import { actions } from "./actions";
import { ApiCollection } from '../../../common/apiCollection';
import { bindingExaminationCourses,getExaminationCoursesSelect } from '../../../controller/systemSetting/major';

let globalEvent = memoryStore.get('globalEvent');
let addDto = ApiCollection['post/admin/Major/BindingExaminationCourses'].reqDto;

let isHaveCourse = [];
let courseId = [];
let add = [];
let del = [];
let selectTag = [];
let addMajorCourseFrom=null


function initCourseSelect(id) {
    //用dataSource没有筛选
    getExaminationCoursesSelect({ majorId: memoryStore.get('selectedId') }).then((data) => {
        isHaveCourse = []
        for (let i = 0; i < data.length; i++) {
            if (data[i]["isSelect"]) {
                isHaveCourse.push(data[i]["id"])
            }
        }
        console.log(data)
        let opt = {
            dataSource: data,
            dataTextField: "name",
            dataValueField: "id",
            placeholder: "请选择...",
            filter: "contains",
            change: function () {
                compareArr()
            },
            deselect: function (e) {
                compareArr()
            },
        }
        if (!$("#courseSelect").data('kendoMultiSelect')) {
            $("#courseSelect").kendoMultiSelect(opt)
        } else {
            $("#courseSelect").data("kendoMultiSelect").destroy();
            $("#courseSelect").parent().remove();
            $('.courseBox').empty().append(`<input class="" name="examinationCourseId" id="courseSelect">`);
            console.log($(`#courseSelect`))
            $(`#courseSelect`).kendoMultiSelect(opt);
        }
        console.log(isHaveCourse)
        $(`#courseSelect`).data("kendoMultiSelect").value(isHaveCourse)
    })

};
function compareArr() {
    let courseSelect = $("#courseSelect").data('kendoMultiSelect').value();
    //找出两个数组不同的item
    let newArr = isHaveCourse.concat(courseSelect).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);

    });
    console.log('------------newArr----------')
    console.log(newArr)
    if (newArr) {
        add = [];
        del=[]
    }
    //item与已绑定的数组比较
    for (let j = 0; j < newArr.length; j++) {
        if (isHaveCourse.indexOf(newArr[j]) > -1) {
            for (let k = 0; k < isHaveCourse.length; k++) {
                if (isHaveCourse[k] === newArr[j]) {
                    del.push(isHaveCourse[k])
                }
            }
        } else {
            add.push(newArr[j])
        }
    }
    console.log(add, del)
}
$(function () {
    let addCourseWindow = new KendoWindow('#addCourseWindow', {
        title: '绑定科目',
        open: function () {
            initCourseSelect()
            if (!addMajorCourseFrom) {
                addMajorCourseFrom = new Form('#addCourseWindow', {
                    dto: addDto,
                    onSubmit: function () {
                        let data = {
                            'majorId': memoryStore.get('selectedId'),
                            'add': add,
                            'delete': del
                        }
                        bindingExaminationCourses(data).then((data) => {
                            //clear form + close form
                            addMajorCourseFrom.cancelLoading();
                            addCourseWindow.close();
                            globalEvent.trigger(actions.refresh);
                        }).catch((error) => {
                            addMajorCourseFrom.cancelLoading();
                        })
                    }
                });
            }
        }
    });
    globalEvent.on("openBindCourse", function () {
        addCourseWindow.open();
    })
})
