import { initCurrentPath } from './currentPath'
import '../../component/schoolSelector'
import { getCurrentUserInfo, adminEditPassword } from '../../controller/user';
import { ApiCollection } from '../../common/apiCollection';
import { KendoWindow } from '../../component/kendo/window';
import { Form } from "../../component/form";
import { GlobalEventName } from '../../common/globalEventName';
import { ErrorNotification} from '../../component/notification';
let global = memoryStore.get('globalEvent');
let editForm = null;
let editDto = ApiCollection['post/admin/User/EditPassword'].reqDto;
$(function () {
    initCurrentPath()
    //获取当前登录用户信息
    getCurrentUserInfo().then((data) => {
        memoryStore.set("currentUserInfo", data)
        global.trigger(GlobalEventName.getCurrentUserInfo, [data]);

    }).catch((error) => {

    });
    let resetWindow = new KendoWindow('#editPasswordWindow', {
        title: '修改密码',
        size: "small",
        open: function () {
            if (!editForm) {
                editForm = new Form('#editPasswordWindow', {
                    dto: editDto,
                    onSubmit: function () {
                        let t = editForm.getValue();
                        if (t.password === t.confirmPassword) {
                            adminEditPassword(t).then((data) => {
                                editForm.cancelLoading();
                                editForm.clearForm();
                                resetWindow.close();
                                globalEvent.trigger(actions.refresh);
                            }).catch((error) => {
                                editForm.cancelLoading();
                            })
                        } else {
                            ErrorNotification.show("两次密码不一致！", "error")
                            editForm.cancelLoading();
                        }
                        
                    },
                    validation: {
                        rules: {
                            sameVal: function (input) {
                                if (input.attr('name') === 'confirmPassword') {
                                    return $('#editPasswordWindow').find('input[name=password]').val() === $('#editPasswordWindow').find('input[name=confirmPassword]').val()
                                } else {
                                    return true
                                }
                            },
                            regx: function (input) {
                                if (input.attr('name') === 'password') {
                                    let v = $(input).val();
                                    console.log(v);
                                    return /(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*?[-._@+^!?#$]).{6,16}$/g.test(v)
                                } else {
                                    return true
                                }
                            }
                        },
                        messages: {
                            sameVal: function (input) {
                                return "两次密码必须一致"
                            },
                            regx: function (input) {
                                return `密码由6-16位大小写和特殊字符组成`
                            }
                        }
                    }
                });
            }
        }
    });
    //重置密码
    $("#adminResetPwd").off().on("click", function () {
        resetWindow.open()
    })
})