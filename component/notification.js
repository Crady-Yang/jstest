import { ErrorMessageCenter } from '../common/errorMessageCenter'

let commonOpt = {
  position: {
    pinned: true,
    top: 30,
    right: 30
  },
  //animation: {
  //  open: {
  //    effects: "slideIn:left"
  //  },
  //  close: {
  //    effects: "slideIn:left",
  //    reverse: true
  //  }
  //},
  stacking: "down",
};

let t1 = Object.assign({},commonOpt,{
    autoHideAfter: 3000,
    show: onShow
});

let t2 = Object.assign({},commonOpt,{
  autoHideAfter:5000,
  templates:[
    {
      type: "error",
      template:function (data) {
        if(typeof data === 'string'){
          data = { message:data }
        }
        if(!data.message && data.content){
          data = { message:data.content }
        }
        if(!data.message){
          data = { message:'发生错误' }
        }
        let title = data.title ? `<h3>${data.title}</h3>` : '';
        let message = data.message ? `<p>${data.message}</p>` : '';
        return  `
        <div class="notificationWrapper" data-errorid="${data.errorId}">
          ${title}
          ${message}
        </div>
      `
      }
    }
  ],
  show(e){
    console.log(e);
    console.log(e.element);
    onShow(e)
    e.element.on('click',function () {
      let errorId = $(this).find('[data-errorid]').attr('data-errorid');
      ErrorMessageCenter.remove(errorId)
    })
  }
});

function onShow(e) {
    if (e.sender.getNotifications().length == 1) {
        var element = e.element.parent(),
            eWidth = element.width(),
            eHeight = element.height(),
            wWidth = $(window).width(),
            wHeight = $(window).height(),
            newTop, newLeft;

        newLeft = Math.floor(wWidth / 2 - eWidth / 2);
        newTop = Math.floor(wHeight / 2 - eHeight / 2);

        e.element.parent().css({ top: newTop, left: newLeft });
    }
}

export const Notification = $("#commonNotification").kendoNotification(t1).data("kendoNotification");

export const ErrorNotification = $("#errorNotification").kendoNotification(t2).data("kendoNotification");
