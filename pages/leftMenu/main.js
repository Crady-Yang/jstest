import { MenuRender } from './renderMenu';
import { getCurrentUserInfo } from '../../controller/user';
import { getLeftMenuList } from '../../controller/rbac/menu';
import {jsonParse} from '../../common/utils';
let eventBus = memoryStore.get('globalEvent');
$(function () {
    //let option = {
    //    model: '',
    //    dataCache:''
    //};

    let option = {
        el: '',  //menuId
        type:'',    //home or admin 
        topMenuClass: 'firstMenu',  //第一个菜单的className
        activeClass: 'active',
        ulClass: '',
        liClass: '',  //li上的className
        menuDomReady: function () { },  //调用动画方法
        rendUser: function () { }
    };

     let menuComponent= function(opt) {

        let menuId = opt.el;

        let menuType = opt.type || 'home';  //默认为前台页面的menu

        let menu =new MenuRender(opt);


        let dataKey = {
            currentUser: 'currentUser',
            menuList: 'menuList'
        };

        let currentUserInfo = {};

        let menuData ;

        let rendUserInfo = function () {
            getCurrentUserInfo().then((data)=>{
                currentUserInfo = data;
                eventBus.trigger('currentUserInfoReady',[data])
                //EventCenter.publish('currentUserInfoReady', data);

                menu.rendUserInfo(data);
            }).catch(function (error) {
                console.log(error);
            })
        };

        let  rendMenuCallback=function(){
            getLeftMenuList({page:1,pageSize:1000}).then((data)=>{
                console.log('------menuData--------');
                console.log(data);
                if (data === '') {
                    window.location.replace('/admin/login');
                }
                console.log('----menu--------');
                console.log(data);
                //data = data.sort(function (a,b) {
                //    return a.sort - b.sort;
                //});
                //data = data['list'];
                //alert('rend menu');
                menu.rendMenu(data);
                localStorage.menu = JSON.stringify(data);
            }).catch(function (error) {
                console.log(error);
            })
        }
        let rendMenu = function () {
            //roden 1.22
            //菜单不需要页数页码
            //doris 4.24 menu存cookie
            //alert('meun');
            //console.log('meun.............................................');
            //console.log(localStorage.menu);

            //alert('controller');

            //let localMenuData = localStorage.menu;
            let localMenuData;

            if (localMenuData) {
                localMenuData = jsonParse(localMenuData);

                menu.rendMenu(localMenuData);
                // console.log(typeof localMenuData);
                // console.log(JSON.stringify(cookieMenuData));
            } else {
                //alert('ajax start');
                rendMenuCallback();
            }

        };

        let execute = function () {
            rendUserInfo();
            //alert('start');


            rendMenu();

            $('#refreshMenu').off('click').on('click', function () {
                rendMenuCallback();
            });
            eventBus.on('currentUserRefresh',function (data) {
                rendUserInfo();
            });
            eventBus.on('menuRefresh',function (data) {
                rendMenu();
            });
            // EventCenter.listen(Config.globalEventKey.currentUserRefresh, function (data) {
            //
            //     rendUserInfo();
            // });
            // EventCenter.listen(Config.globalEventKey.menuRefresh, function (data) {
            //
            //     rendMenu();
            // });

            //$(menuId).hover(function () {
            //    $('#refreshMenu').stop(true, true).show();
            //}, function () {
            //    $('#refreshMenu').stop(true, true).hide();
            //});

            //console.log($(menuId).children('li').length);
            //setTimeout(function () {
            //    $(menuId).metisMenu();
            //}, 2000);
        };

        //let getCurrentUserInfo = function () {
        //    return currentUserInfo;
        //};



        return {
            execute: execute
        }

    };
    console.log($("#leftMenu"))
    let menun = menuComponent({
        el: '#leftMenu',
        type: 'admin'
    });
    menun.execute();
})
