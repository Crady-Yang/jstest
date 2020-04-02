import { BaseComponent } from "../../../component/baseComponent";
import {getExaminationCoursesSelect } from '../../../controller/systemSetting/major';


export class CourseSelect extends BaseComponent {
    constructor(el, opt) {
        opt = opt || {};
        super(el, opt);
        this.selectEl = el || null;
        this.selectElParent = opt.selectElParent || null;
        this.isHaveCourse = [];
        this.courseId = [];
        this.add = [];
        this.del = [];
        this.selectTag = [];
    }
    initCourseSelect(id) {
        let that=this
        //用dataSource没有筛选
        getExaminationCoursesSelect({ majorId: memoryStore.get('selectedId') }).then((data) => {
            that.isHaveCourse = []
            for (let i = 0; i < data.length; i++) {
                if (data[i]["isSelect"]) {
                    that.isHaveCourse.push(data[i]["id"])
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
                    that.compareArr()
                },
                deselect: function (e) {
                    that.compareArr()
                },
            }
            if (!$(that.selectEl).data('kendoMultiSelect')) {
                $(that.selectEl).kendoMultiSelect(opt)
            } else {
                $(that.selectEl).data("kendoMultiSelect").destroy();
                $(that.selectEl).parent().remove();
                console.log($(that.selectElParent))
                $(that.selectElParent).append(`<input class="" name="examinationCourseId"/>`);
                $(that.selectEl).kendoMultiSelect(opt);
            }
            $(that.selectEl).data("kendoMultiSelect").value(that.isHaveCourse)
        })
    };
    compareArr() {
        let that = this;
        let courseSelect = $(that.selectEl).data('kendoMultiSelect').value();
        //找出两个数组不同的item
        let newArr = that.isHaveCourse.concat(courseSelect).filter(function (v, i, arr) {
            return arr.indexOf(v) === arr.lastIndexOf(v);

        });
        console.log('------------newArr----------')
        console.log(newArr)
        if (newArr) {
            that.add = [];
            that.del = []
        }
        //item与已绑定的数组比较
        for (let j = 0; j < newArr.length; j++) {
            if (that.isHaveCourse.indexOf(newArr[j]) > -1) {
                for (let k = 0; k < that.isHaveCourse.length; k++) {
                    if (that.isHaveCourse[k] === newArr[j]) {
                        that.del.push(that.isHaveCourse[k])
                    }
                }
            } else {
                that.add.push(newArr[j])
            }
        }
    }
    init() {
        let that = this;
        that.initCourseSelect()
    }
}

