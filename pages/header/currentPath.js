import { PageCollection } from '../../service/page/pageCollection';

let c = window.location.pathname.toLowerCase().split("/");
let pageName = c[c.length-1]

export function initCurrentPath() {
    if (pageName === "addblog") {
        if (window.location.search) {
            PageCollection[pageName].page = "编辑信息"
        } else {
            PageCollection[pageName].page = "添加信息"
        }
    }
    if (pageName === "addexaminationschedule") {
        if (window.location.search) {
            PageCollection[pageName].page = "编辑复试安排"
        } else {
            PageCollection[pageName].page = "添加复试安排"
        }
    }
    let data = PageCollection[pageName];
   let domList = `<span class="path">${data.module}</span><span class="spliter"> / </span><span class="path">${data.page}</span>`
    $('#headerBox').find('.currentPath').empty().append(domList);
}
