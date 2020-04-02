import { login, forgetPassword } from '../../controller/user';
import { ApiCollection } from '../../common/apiCollection';
import { Form } from "../../component/form";
import { jsonParse } from '../../common/utils';
import { ErrorNotification, Notification } from '../../component/notification';

let loginDto = ApiCollection['post/admin/User/Login'].reqDto
let sendDto = ApiCollection['post/admin/User/ForgetPassword'].reqDto
//刷新验证码
function refreshVerificationCode(that) {
    var numkey = Math.random();
    $(that).find("img").attr("src", "/admin/User/imageVerificationCode?reg=" + numkey);
    
}
function onEnterLogin() {
    $('#sendCodeBox').fadeOut();
    $('#loginBox').fadeIn();
}

function onEnterSendEmail() {
    $('#sendCodeBox').fadeIn();
    $('#loginBox').fadeOut();
}

$(function () {
    store.remove('access_token');
    store.remove('schoolId');
    store.remove('collegelId');
    Cookies.remove('tk');
    refreshVerificationCode()
    let loginForm = new Form('#loginBox', {
        dto: loginDto,
        onSubmit() {
            let data = loginForm.getValue();
            data.code = data.code.toLowerCase();
            login(data).then((data) => {
                store.set('access_token', data['access_token']);
                Cookies.set('tk', data['access_token'])
                // 上次退出登录的路径
                let path = window.location.href.split('?redpath=')[1];
                if (path) {
                    window.location.href = `/admin/path`;
                } else {
                    window.location.href = `/admin/ApplicationReview`;
                }
                loginForm.cancelLoading();
            }).catch((error) => {
                console.log(error);
                loginForm.cancelLoading();
            })
        }
    });
    let sendForm = new Form('#sendCodeBox', {
        dto: sendDto,
        onSubmit() {
            forgetPassword({
                email: $('#sendCodeBox').find('input[name=email]').val(),
                code: $('#sendCodeBox').find('input[name=code]').val()
            }).then((data) => {
                Notification.show("邮件发送成功！", "success")
                sendForm.cancelLoading();
            }).catch((err) => {
                sendForm.cancelLoading();
            })
        }
    });
    $(document).keydown(function (e) {
        if (e.keyCode === 13) {
            $('#loginBtn').click()
        }
    });
    //找回密码
    $('.enterSendEmailButton').on('click', function () {
        onEnterSendEmail()
    });

    $('#enterLoginButton').on('click', function () {
        onEnterLogin()
    });
    $(".code_img").on('click', function () {
        let that=this
        refreshVerificationCode(that)
    });
});