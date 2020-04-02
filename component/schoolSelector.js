import { PageCollection } from '../service/page/pageCollection';
import { GlobalEventName } from '../common/globalEventName';
import { getSchoolSelectList } from '../controller/rbac/school';
import { getCollegeSelectList } from '../controller/rbac/college';

let c = window.location.pathname.toLowerCase().split("/");
let pageName = c[c.length - 1];
let schoolSelector = null;
let collegeSelector = null;
let current = PageCollection[pageName];
let global = memoryStore.get('globalEvent');

function initCollegeDropdown() {
    let optionLabel = "";
    //消息记录页面可以不选学院
    if (current.name === "messagerecordlist" || current.name === "blogList") {
        optionLabel="请选择学院"
    }
    if (current.ifCollege) {
        $('.collegeSelectorBox').removeClass('hidden');
        let storeSchoolId = store.get('schoolId')
        let schoolId = storeSchoolId ? storeSchoolId : schoolSelector.value();
        let collegeDatasource = getCollegeSelectList().mergeQuery(function () {
            return {
                schoolId: schoolId
            }
        }).dataSource;
        if (collegeSelector) {
            $(".collegeSelectorBox").empty().append(`<input id="collegeSelector" />`)
        }
        collegeSelector=$('#collegeSelector').kendoDropDownList({
            //cascadeFrom: "schoolSelector",用这个的话设置school为缓存中的学校之后college会调2遍接口
            dataTextField: "name",
            dataValueField: "id",
            dataSource: collegeDatasource,
            index: 0,
            optionLabel: optionLabel,
            valueTemplate: function (value) {
                return `<i class="fas fa-flag" style="padding-right: 1em" title="学院"></i> ${value.name}`
            },
            dataBound: function () {
                //alert("collegeDatabound")
                let value = this.value();
                let data = collegeDatasource.data()
                let schoolId = schoolSelector.value()
                let storeCollegelId = store.get('collegelId');
                let hasStoreCollege = false;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].id === storeCollegelId) {
                        hasStoreCollege = true;
                        break
                    }
                }
                if (hasStoreCollege) {
                    this.value(storeCollegelId)
                    value = storeCollegelId
                } else {
                    store.set('collegelId', value)
                }
                memoryStore.set('selectedCollegeId', value);
                memoryStore.set('selectedSchoolId', schoolId);
                global.trigger(GlobalEventName.SelectCollege, [value]);
            },
            change: function () {
                //alert("collegeChange")
                let value = this.value();
                let schoolId = schoolSelector.value()
                store.set('collegelId', value)
                memoryStore.set('selectedSchoolId', schoolId);
                memoryStore.set('selectedCollegeId', value);
                global.trigger(GlobalEventName.CollegeChange, [value]);
            }
        }).data("kendoDropDownList");
    }
}
$(function () {
    let schoolData = null;
    if (current.ifSchool){
        $('.schoolSelectorBox').removeClass('hidden');
        //消息记录页面或角色管理或博客列表和博客详情页面学校需要显示系统学校
        if (current.name === "role" || current.name === "messagerecordlist" || current.name === "blogList" || current.name === "addBlog") {
            schoolData = getSchoolSelectList().mergeQuery(function () {
                return {
                    isDisplaySystem: true
                }
            }).dataSource;
        } else {
            schoolData = getSchoolSelectList().dataSource;
        }
        
        if (!$('#schoolSelector').data("kendoDropDownList")) {
            schoolSelector = $('#schoolSelector').kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: schoolData,
                index: 0,
                valueTemplate: function (value) {
                    return `<i class="fas fa-university" style="padding-right: 1em" title="学校"></i> ${value.name}`
                },
                dataBound: function () {
                    //alert("schoolDatabound")
                    let value = this.value();
                    let storeSchoolId = store.get('schoolId')
                    let data = schoolData.data()
                    if (storeSchoolId) {
                        this.value(storeSchoolId)
                    }
                    let hasStoreSchool = false;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].id === storeSchoolId) {
                            hasStoreSchool = true;
                            break
                        }
                    }
                    if (hasStoreSchool) {
                        this.value(storeSchoolId)
                        value = storeSchoolId
                    } else {
                        store.set('schoolId', value)
                    }
                    this.value(value)
                    memoryStore.set('selectedSchoolId', value);
                    global.trigger(GlobalEventName.SelectSchool, [value])
                    initCollegeDropdown()
                },
                change: function () {
                   // alert("schoolCollege")
                    let value = this.value();
                    store.set('schoolId', value)
                    memoryStore.set('selectedSchoolId', value);
                    initCollegeDropdown()
                    global.trigger(GlobalEventName.SchoolChange, [value]);
                }
            }).data("kendoDropDownList");
        }
    }
    
});
