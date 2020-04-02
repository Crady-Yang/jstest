import { BaseComponent } from '../../component/baseComponent';
import {formatTreeData,treeDataFormat} from "../../common/utils";
let eventBus = memoryStore.get('GlobalEvent');
export class MenuRender extends BaseComponent {
    constructor(opt) {
        super(opt);
        this.config = {
            portraitBox: '#menuPortraitBox',
            portraitClass: '.portrait',
            userNameClass: '.userName',
            roleTitleClass: '.subTitle',
            //menuId: '#menu',
            topMenuClass: 'firstMenu',
            activeClass: 'active',
            //树桩菜单的键值
            childrenKey: 'list',
            //模块上的ID
            liAttr: 'data-moduleId',
            //默认icon //fa
            defaultIcon:'<i class="fas fa-cog"></i>',
            //默认模块名
            defaultModuleName: '未分配模块',
            defaultArrowIcon: '<i class="fa fa-angle-left arrow" aria-hidden="true"></i>',
            //默认头像
            portrait: {
                '男': '..//..//..//common//portrait_male.png',
                '女': '..//..//..//common//portrait_female.png',
                '未知': '..//..//..//common//portrait_unkown.png'
            },
            ulClass: '',
            aClass:'',
            liClass: ''  //li上的className
            //relativePortraitPath: '..\\..\\'
        };
        this.menuId=opt.el;
        this.menuDataCache=[];
        this.config = $.extend({}, this.config, opt);
        this.defaultMune='';
        this.ifInit=false;
    }




    //data cache

    //默认菜单 e.g index.aspx
    //let defaultMune = '<li class="active firstMenu defaultMune"><a href="index.aspx"><i class="fa fa-desktop" aria-hidden="true"></i>首页</a></li>';


    //先要获取用户信息
    // let getUserInfoPromise = new Promise(function(resolve, reject) {
    //    Ajax.getUserInfo({}, function (data) {
    //        resolve(data);
    //    });
    // });



    //激活当前菜单
    activeMenu() {
        let $menu = $(this.menuId),
            $active = $menu.find('.' + this.config.activeClass),
            $topMenu = $menu.find('.'+this.config.topMenuClass),
            $a = $menu.find('a[href]'),
            menuTitle = '',
            currentUrl = window.location.pathname;
        //console.log(currentUrl);

        for (let i = 0; i < $a.length; i++) {
            //console.log(currentUrl);
            //console.log($a.eq(i).attr('href'));
            //let aString =
            if ($a.eq(i).attr('href').toLowerCase() === currentUrl.toLowerCase()) {
                menuTitle = $a.eq(i).children('span').text();
                $active.removeClass(this.config.activeClass);
                let $li = $a.eq(i).parents('.'+this.config.topMenuClass);
                //console.log(currentUrl);
                //console.log($li);

                if ($li.find('ul').length > 0) {
                    //console.log();
                    $li.children('a').click();
                } else {
                    $li.addClass(this.config.activeClass);
                }
                break;
            }
        }

        return menuTitle;
    };


    //生成菜单html
    rendMenuDom (data) {

        //alert(data.length);
        console.log(data);
        data = data.map((v)=>{
            v._level = v.level;
            delete v.level;
            return v;
        });
        data=formatTreeData(data,{newKey:this.config.childrenKey});
        //data =treeDataFormat(3, 'id', 'parentId', this.config.childrenKey, data);
       // data = Common.treeDataFormat(3, 'id', 'parentId', this.config.childrenKey, data);

        let $menu = $(this.menuId),
            menuArray = [];

        //$menu.empty();

        // alert($menu.length);

        for (let i = 0; i < data.length; i++) {

            let menuHtml = this.menuRecursion([data[i]], ''),
                sortCode = data[i]['displayOrder'];
            menuArray.push({
                sortCode: sortCode,
                html:menuHtml
            });
        }
        
        // menuArray = menuArray.sort(function (a, b) {
        //     a = a.sortCode;
        //     b = b.sortCode;
        //     return a - b;
        // });

        $menu.append(this.defaultMune);
        console.log('------menuArray--------')
        console.log(menuArray)
        for (let i = 0; i < menuArray.length; i++) {
            $menu.append(menuArray[i]['html']);

            //console.log(menuArray[i]['html']);
        }
        $menu.children('li').addClass(this.config.topMenuClass);

        // let that=this;
        // //绑定菜单点击
        // let $li = $menu.children('li');
        // for (let i = 0; i < $li.length; i++) {
        //    (function (i) {
        //        let j = i;
        //        that.bindParentMenuClick($li.eq(j));
        //    })(i);
        // };

        //alert('rend finished');
    };


    //生成menuHtml
    menuRecursion(data, html) {
        //console.log(data);
        //console.log(html);
        let liHtmlArray = [],
            finalHtml = '';

        //规整menu数据格式
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            let url = data[i]['url'] || '#',
                childrenHtml = '',
                arrowIcon = '',
                sortCode = data[i]['displayOrder'] || 9999,
                icon = data[i]['icon'] || this.config.defaultIcon,
                iconHtml = '',
                liClassName = '',
                menuText = data[i]['title'] || data[i]['name'] || data[i]['keywords'];
            if (!data[i]['isLink']) {
                url = '#';
            }
            let liHtml = '<li class="'+ this.config.liClass +'"><a class="'+ this.config.aClass +'" href="' + url + '">' + iconHtml + '<span>' + menuText + '<span>' + arrowIcon + '</a>' + childrenHtml + '</li>';

            if (!html) {
                iconHtml = `<span style="padding-right: 1rem">${icon}</span>`;
            } else {
                iconHtml = '';
            }
            if (data[i][this.config.childrenKey] && data[i][this.config.childrenKey].length > 0) {
                childrenHtml = '<ul aria-expanded="true" class="'+ this.config.ulClass +'">' + this.menuRecursion(data[i][this.config.childrenKey], liHtml) + '</ul>';
            }

            if (childrenHtml) {
                arrowIcon = this.config.defaultArrowIcon;
            }

            if (url === '#' && childrenHtml === '') {

            } else {
                liHtmlArray.push({
                    html: '<li><a href="' + url + '">' + iconHtml + '<span>' + menuText + '<span>' + arrowIcon + '</a>' + childrenHtml + '</li>',
                    sortCode: sortCode
                });
            }
        }
        liHtmlArray = liHtmlArray.sort(function (a, b) {
            a = a.sortCode;
            b = b.sortCode;
            return a - b;
        });

        for (let i = 0; i < liHtmlArray.length; i++) {
            finalHtml += liHtmlArray[i]['html'];
        }
        //console.log(html + '<ul>' + liHtml + '</ul>');
        //if (html === '') {
        return finalHtml;
        //} else {
        //    return html + '<ul aria-expanded="true">' + finalHtml + '</ul>';
        //};

    };

    //titleBox
    rendTitleBox(menuTitle) {
        let $menu = $(this.menuId),
            $active = $menu.find('.' + this.config.activeClass);

        let $box = $('.titleContainer').children('.titleBox'),
            $icon = $box.children('.titleIcon'),
            $title = $box.find('.parentTitle'),
            icon = $active.find('i').attr('class');

        if ($active.length > 0) {
            $icon.empty().append('<i class="' + icon + '" aria-hidden="true"></i>');
            $title.text(menuTitle);
        }
    };


    //绑定高度
    autoHeight(){

        let $menuBox = $(this.menuId).parent('.menuBox');
        let docHeight = $(document).height();
        let menuHeight = $menuBox.height();

        if (menuHeight < docHeight) {
            $menuBox.height(docHeight);
        }
        $(document).scroll(function () {
            //console.log(1);
            let docHeight = $(document).height();
            let menuHeight = $menuBox.height();
            //console.log(docHeight);
            //console.log(menuHeight);
            //console.log(docHeight - 220);
            if (menuHeight < docHeight) {
                $menuBox.height(docHeight);
            }
        });
    };

    //收起menu
    collapseMenu() {
        let $menu = $(this.menuId),
            $active = $menu.find('.' + this.config.activeClass),
            $li = $menu.children('li');

        for (let i = 0; i < $li.length; i++) {
            if ($li.children('ul').length > 0) {
                $li.children('ul').attr('aria-expanded', false).addClass('collapse');
            }
        }
    };

    //过滤EableMark，IsDisplay, type,DeleteMark
    filterData(data) {
        let final = [];
        //let type = String(config.type);
        // if (type === 'admin') {
        //     type = Config.statusMap.menuType.admin;
        // }
        // if (type === 'home') {
        //     type = Config.statusMap.menuType.home;
        // }
        console.log(type);
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            if (data[i]['isEnabled'] && (!data[i]['isDeleted']) && data[i]['isDisplay'] && String(type) === String(data[i]['type'])) {
                final.push(data[i]);
            }
        }
        return final;
    };


    //redner menu to frontpage
     rendMenu(data) {

        //data = filterData(data);
        console.log(data);

        this.clear();
        //菜单去重
         data=data.filter(function(element,index,self){
             return self.findIndex(el=>el.id==element.id)===index
         })
        this.rendMenuDom(data);

        this.autoHeight();
        if (this.ifInit) {
            $(this.menuId).metisMenu('dispose');
        }
        $(this.menuId).metisMenu();
        this.ifInit = true;

        //选中当前菜单
        let menuTitle = this.activeMenu();

        //titlebox
        this.rendTitleBox(menuTitle);
        // if (opt.type === 'admin') {
        //
        // }
        if (this.opt.menuDomReady) {
            this.opt.menuDomReady();
        }
    };

    //
    rendUserInfo(data) {

        // if (config.type === 'home' && config.rendUser) {
        //     config.rendUser(data);
        // }
        if (!data) {
            return;
        }
        console.log(data);
        let account = data.name,
            //email = data.email,
            portrait = data.portrait ||'/images/defaultAvatar.png',
            $portraitBox = $('.portraitBox'),
            //$portraitImg = $portraitBox.find(config.portraitClass),
            Gender = data.gender || '未知',
            id = data.id;
        //渲染头像
        //
        // if (portrait === '') {
        //     let host = window.location.host;
        //     portrait = config.portrait[Gender];
        //     $portraitBox.find(config.portraitClass).append('<div style="height: 100%;width: 100%;border-radius: 50%;background-image: url(http://' + host + '/resource/common/' + portrait + ');background-position: center center;background-repeat:no-repeat;"></div>');
        // } else {
        //     Common.getPortaitFlow(portrait, $portraitImg)
        // }
        $portraitBox.find('.portrait').append('<img style="border-radius: 50%;height: 100%;width: 100%;" src="../' + portrait + '" />');

        $portraitBox.find('.userName').html(`<p>你好！${account}</p>`);
        // if (config.type === 'admin') {
        //
        //     //$portraitBox.find(config.roleTitleClass).text(compayName);
        // }
    };

    getPageData() {
        return this.menuDataCache;
    };

    clear() {
        let $menu = $(this.menuId);
        let $parent = $menu.parent();

        $menu.empty();

    };
}




        // return {
        //     // init: init,
        //     getPageData: getPageData,
        //     rendUserInfo: rendUserInfo,
        //     rendMenu: rendMenu,
        //     clear:clear
        // }

    //system.menu = menu;
