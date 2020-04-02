import {BaseComponent} from './baseComponent';

export class SubmitTaskProgressBar extends BaseComponent {
    constructor(opt) {
        opt = opt || {};
        super(opt);
        this.data=opt.data;
    }
    init(){
        let data = JSON.parse(this.data),
            successNumber = parseInt(data.Success) ,
            totalNumber = parseInt(data.Total),
            failNumber = parseInt(data.Error),
            uploadNumber = successNumber + failNumber;
        $("#submitProgressBar .successnotice").hide();
        $("#submitProgressBar .title").show();
        $("#submitProgressBar .count").text(`${uploadNumber}/${totalNumber}`)
        $("#submitProgressBar").fadeIn(2000);
        //进度条渲染
        if ($("#submitProgressBar .progressBar").data('kendoProgressBar')) {
            $("#submitProgressBar .progressBar").data('kendoProgressBar').destroy();
            $("#submitProgressBar .progressBar").empty();
        }
        $("#submitProgressBar .progressBar").kendoProgressBar({
            type: "percent",
            max: 100,
            complete: function () {
                //当全部任务上传完成时提示任务上传完成
                console.log(totalNumber, failNumber)
                $("#submitProgressBar .successnotice .successcount").text(totalNumber);
                $("#submitProgressBar .successnotice .failcount").text(failNumber)
                $("#submitProgressBar .successnotice").show();
                $("#submitProgressBar .title").hide();
                setTimeout(function () {
                    $("#submitProgressBar").fadeOut(5000);
                }, 2000)
            }
        }).data('kendoProgressBar');
        let progressValue = Math.round(uploadNumber / totalNumber * 100);
        $("#submitProgressBar .progressBar").data('kendoProgressBar').value(progressValue);
    }

    setValue(percent){
        $("#submitProgressBar .progressBar").data('kendoProgressBar').value(percent);
    }
}
