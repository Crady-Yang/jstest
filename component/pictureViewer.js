import { BaseComponent } from './baseComponent'
import { getSampleBySkuDataSource,getSkuList } from '../controller/image/picture'
import { ImageLoader } from './imageLoader'
import { cal180 } from '../controller/orderCommon'
import { ThemeColor } from '../common/theme'
import { ImageMagnifier } from './imageMagnifier'
import { KendoWindow } from './kendo/window'
import { Notification } from './notification'

/**
 * 根据SKU获取图片列表
 * 计算180天过期时间
 */
export class PictureViewer extends BaseComponent{
	/**
	 * PictureViewer constructor
	 * @param el
	 * @param opt
	 * @param opt.ifCalDue  是否标记180天过期
	 * @param opt.season  计算180需要season
	 * @param opt.ifStyle 是否显示style下拉框
	 * @param opt.ifViewBig 是否可以查看大图
	 */
	constructor(el,opt){
		super(el,opt);
		opt = Object.assign({
			ifCalDue:true,
			ifStyle:false,
			ifViewBig:true,
			onDataBound:function () {},
		},opt);
		let that = this;
		this.dataSource = getSampleBySkuDataSource().mergeQuery(function () {
			let sku = that.sku;
			if(that.ifStyle && that.styleInstance){
				sku = that.styleInstance.value() || sku;
			}
			return { sku,isLyrewing:true }
		}).dataSource;
		this.skuDataSource = getSkuList().mergeQuery(function () {
			let style = that.sku.substring(0,6);
			let projectId = that.projectId;
			return { style,projectId }
		}).dataSource;
		this.sku = null;
		this.projectId = null;
		this.ifCalDue = opt.ifCalDue;
		this.ifStyle = opt.ifStyle;
		this.ifViewBig = opt.ifViewBig;
		this.season = opt.season;
		this.onDataBound = opt.onDataBound; // dataBound事件
		this.infoTemplate = opt.infoTemplate; // 图片信息模板
		this.listInstance = null;
		this.pagerInstance = null;
		this.styleInstance = null;
		this.$list = null;
		this.$pager = null;
		this.$style = null;
		this.viewBigWindow = null;
		this.imageMagnifier = null;
		this.currentIndex = 0;	// 查看大图时，当前展示的
		this.$previousBtn = null;
		this.$nextBtn = null;
		this.$viewBigPictureWindow = null;
		this.$imageMagnifier = null;
		this.$el.addClass('pictureViewer');

	}

	initDom(){
		let that = this;
		let selectorDom = this.ifStyle ? '<input class="styleSelector" />':'';
		let viewBigWindowDom = this.ifViewBig ?
			`<div class="viewBigPictureWindow hidden" id="viewBigPictureWindow">
				<div class="imageMagnifier"></div>
				<div style="width: 200px;margin: 0 auto;position: relative">
					<button disabled="disabled" class="previousBtn k-button" style="position: absolute;left: 0;"><span class="k-i-arrow-chevron-left k-icon"></span></button>
					<button disabled="disabled" class="nextBtn k-button pull-right" style="position: absolute;right: 0;"><span class="k-i-arrow-chevron-right k-icon"></span></button>
					<div class="counter" style="width: 80px;margin: 0 auto;height: 30px;line-height: 30px; text-align: center;"><span class="currentIndex"></span>/<span class="totalCount"></span></div>
				</div>
			</div>`:'';
		this.$el.empty().append(`
				${viewBigWindowDom}
				<div class="selectorWrapper" style="padding-bottom: 20px">${selectorDom}</div>
				<div class="list"></div>
				<div class="pager"></div>
			`);
		//console.log(this.$el);
		this.$list = this.$el.children('.list');
		this.$pager = this.$el.children('.pager');
		this.$style = this.$el.find('.styleSelector');

		this.$viewBigPictureWindow = $('#viewBigPictureWindow');
		this.$previousBtn = this.$viewBigPictureWindow.find('.previousBtn');
		this.$nextBtn = this.$viewBigPictureWindow.find('.nextBtn');
		this.$imageMagnifier = this.$viewBigPictureWindow.find('.imageMagnifier');
	}

	refreshSkuSelector(){
		let that = this;
		if(this.ifStyle){
			this.skuDataSource.read()
		}
	}

	updateNextBtn(){
		if(this.currentIndex === this.dataSource.data().length - 1){
			this.$nextBtn.attr('disabled','disabled')
		}else {
			this.$nextBtn.removeAttr('disabled')
		}
	}

	updatePreviousBtn(){
		if(this.currentIndex === 0){
			this.$previousBtn.attr('disabled','disabled')
		}else {
			this.$previousBtn.removeAttr('disabled')
		}
	}

	bindPrevious(){
		let that = this;
		that.$previousBtn.off('click').on('click',function () {
			that.currentIndex --;
			that.$viewBigPictureWindow.find('.currentIndex').text(that.currentIndex + 1);
			that.updatePreviousBtn();
			that.updateNextBtn();
			that.imageMagnifierLoad();
		});
	}

	bindNext(){
		let that = this;
		that.$nextBtn.off('click').on('click',function () {
			that.currentIndex ++;
			that.$viewBigPictureWindow.find('.currentIndex').text(that.currentIndex + 1);
			that.updatePreviousBtn();
			that.updateNextBtn();
			that.imageMagnifierLoad();
		});
	}

	imageMagnifierLoad(){
		let data = this.dataSource.data()[this.currentIndex];
		if(data){
			this.imageMagnifier.load(data.imagePath)
		}else {
			Notification.show('No Picture Found!','warning')
		}
	}

	bindViewBigPicture(){
		let that = this;
		that.$el.find('.viewBigPictureBtn').off('click').on('click',function () {
			let index = parseInt($(this).attr('data-index'),10);
			that.currentIndex = index;
			if(!that.viewBigWindow){
				that.viewBigWindow = new KendoWindow(that.$el.find('.viewBigPictureWindow'),{
					title:'Large Picture List',
					size:'large',
					open(){
						let windowWidth = that.viewBigWindow.width;
						that.updateNextBtn();
						that.updatePreviousBtn();
						that.$imageMagnifier.height(window.innerHeight - 100);
						that.$viewBigPictureWindow.find('.totalCount').text(that.dataSource.data().length);
						that.$viewBigPictureWindow.find('.currentIndex').text(that.currentIndex + 1);
						if(!that.imageMagnifier){
							that.imageMagnifier = new ImageMagnifier(that.$imageMagnifier,{ width:windowWidth })
						}
						that.imageMagnifierLoad();
					}
				});
				that.bindPrevious();
				that.bindNext();
			}
			that.viewBigWindow.open();
		})
	}

	init(sku,projectId,season){
		let that = this;
		if(sku){
			that.sku = sku;
		}
		if(projectId){
			that.projectId = projectId
		}
		if(season){
			that.season = season;
		}
		if(!this.listInstance){
			this.initDom();
			if(that.ifStyle){
				if(!that.styleInstance){
					that.styleInstance = that.$style.kendoDropDownList({
						dataSource:that.skuDataSource,
						change(e) {
							that.dataSource.read()
						}
					}).data('kendoDropDownList')
				}else {
					that.skuDataSource.read()
				}
			}
			this.pagerInstance = this.$pager.kendoPager({
				dataSource:that.dataSource,
				refresh: true,
				pageSizes: [100, "all"]
			});
			this.listInstance = this.$list.kendoListView({
				dataSource:that.dataSource,
				template:function (item) {
					//rend picture
					item.creationTime = moment(item.creationTime).format('YYYY-MM-DD HH:mm:ss');
					let dueDom = '';
						if(that.ifCalDue && !that.season){
						throw new Error('season is required ifCalcDue is true')
					}
					if(that.ifCalDue){
						let result = cal180(item.creationTime,that.season);
						if(result === 'error'){
							dueDom = `<span style="background-color: ${ThemeColor["error-m"]}" class="lw-label">failed</span>`
						}
						if(!result){
							dueDom = `<span style="background-color: ${ThemeColor["error-m"]}" class="lw-label">Due</span>`
						}
					}
					let viewBigBtn = that.ifViewBig ? `<button class="k-button k-primary viewBigPictureBtn" data-index="${item.index}">View Big</button>`:'';
					let infoDom = that.infoTemplate ? that.infoTemplate(item) : '';
					return  `
						<div class="pictureViewer-item" style="padding: 10px;width: 150px;display: inline-block">
							<div class="picture light-boxShadow" style="width: 150px;height: 150px" data-id="${item.id}" data-path="${item.imagePath}" data-thumb="${item.thumbnailPath}"></div>
							<div class="info">
								<div class="date" style="padding: 8px 0px">${item.creationTime}${dueDom}</div>
								${viewBigBtn}
								${infoDom}
							</div>
						</div>
					`
				},
				dataBound:function () {
					let $pic = that.$list.find('.picture');
					for(let i=0;i<$pic.length;i++){
						let $t = $pic.eq(i);
						let thumbImage = $t.attr('data-thumb');
						let t = new ImageLoader($t);
						t.load(thumbImage)
					}
					if($pic.length === 0){
						console.log(that.$list);
						that.$list.empty().append('no picture')
					}
					that.bindViewBigPicture();
					that.onDataBound()
				}
			}).data('kendoListView');
		}else {
			this.dataSource.read()
		}
	}
}
