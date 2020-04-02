import { newPassword} from '../../controller/user';
import { ApiCollection } from '../../common/apiCollection';
import { Form } from "../../component/form";
import { ErrorNotification, Notification } from '../../component/notification';
import { getUrlparams } from '../../common/utils';

let resetDto = ApiCollection['post/admin/User/NewPassword'].reqDto

$(function () {
    let resetForm = new Form('#resetPasswordBox', {
        dto: resetDto,
        onSubmit() {
            let data = {
                "userId": getUrlparams('userId'),
                "code": getUrlparams('code'),
                "password": $('#resetPasswordBox').find('input[name=password]').val()
            };
            newPassword(data).then((data) => {
                window.open("/admin/login")
                resetForm.cancelLoading();
            }).catch((err) => {
                resetForm.cancelLoading();
            })
        },
        validation: {
            rules: {
                sameVal: function (input) {
                    if (input.attr('name') === 'repeatPassword') {
                        return $('#resetPasswordBox').find('input[name=password]').val() === $('#resetPasswordBox').find('input[name=repeatPassword]').val()
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
});