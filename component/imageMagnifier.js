import { BaseComponent } from './baseComponent'
import { ImageLoader } from './imageLoader'


/**
 * 对单张图片实现放到旋转
 */
export class ImageMagnifier extends BaseComponent{

  constructor(el,opt){
    opt = opt ||{};
    super(el,opt);
    // this.magnifierOpt = opt.magnifierOpt || {mode: 'inside',zoom: 3,zoomable: true};
    this.height = opt.height || this.$el.height();
    this.width = opt.width || this.$el.width();
    this.$leftBtn = opt.$leftBtn; // 左转的按钮
    this.$rightBtn = opt.$rightBtn; // 右转的按钮
    this.$imageWrapper = null;
    this.$largerBtn = null;
    this.$smallerBtn = null;
    this.$toolbarWrapper = null;
    this.loaderInstance = null;
    this.deg = 0; // 当前旋转的角度
    this.zoom = 1;  // 当前放大的倍数
    this.zoomStep = 80; // 每次放大、缩小的宽度上的距离
    this.sizePercent = 0;
  }

  init(){
    let leftDom = this.$leftBtn || `<button class="k-button k-button-xs pull-left turnLeftBtn"><span class="k-icon k-i-reset-sm"></span></button>`;
    let rightDom = this.$rightBtn || `<button class="k-button k-button-xs pull-right turnRightBtn"><span class="k-icon k-i-refresh-sm"></span></button>`;
    this.height = this.$el.height();
    this.$el.addClass('imageMagnifierWrapper').empty().append(`
      <div class="imageMagnifier-imageWrapper" style="height: ${this.height-40}px;width:100%;overflow: scroll"></div>
      <div class="imageMagnifier-toolbarWrapper" style="height: 30px;padding-top:10px;">
        <div class="clearfix" style="width: 88px;margin: 0 auto;">
            ${leftDom}${rightDom}  
            <div class="k-button k-button-xs pull-left largerBtn"><span class="k-icon k-i-plus-outline"></span></div>
            <div class="k-button k-button-xs pull-left smallerBtn"><span class="k-icon k-i-minus-outline"></span></div>
        </div>
        
      </div>
    `);
    let that = this;
    this.$leftBtn = this.$el.find('.turnLeftBtn');
    this.$rightBtn = this.$el.find('.turnRightBtn');
    this.$largerBtn = this.$el.find('.largerBtn');
    this.$smallerBtn = this.$el.find('.smallerBtn');
    this.$imageWrapper = this.$el.find('.imageMagnifier-imageWrapper');
    this.$toolbarWrapper = this.$el.find('.imageMagnifier-toolbarWrapper');
    this.loaderInstance = new ImageLoader(this.$imageWrapper,{
      ifResize:false,
      onLoadSuccess(){
        let $imag = that.$imageWrapper.find('img');
        $imag.css({"width":"100%","height":"auto" });
        that.sizePercent = that.loaderInstance.imageHeight / that.loaderInstance.imageWidth;
        // let elWidth = that.$el.width();
        // that.$el.find('.imageMagnifier-imageWrapper').css("width",`${elWidth}px`)

        setTimeout(function () {
          console.log($imag.width());
          console.log($imag.width()*that.sizePercent);
          $imag.width($imag.width());
          $imag.height($imag.width()*that.sizePercent)
        },200)

      }
    });
    this.bindLarger();
    this.bindSmaller();
    this.bindLeft();
    this.bindRight();
  }

  bindLarger(){
    let that = this;
    that.$largerBtn.off('click').on('click',function () {
      that.zoom += that.zoomStep;
      let w = that.$imageWrapper.find('img').width() + that.zoomStep;
      let h = that.$imageWrapper.find('img').height()+ that.zoomStep*that.sizePercent;
      that.$imageWrapper.find('img').height(h).width(w)
    })
  }

  bindSmaller(){
    let that = this;
    that.$smallerBtn.off('click').on('click',function () {
      that.zoom -= that.zoomStep;
      let w = that.$imageWrapper.find('img').width() - that.zoomStep;
      let h = that.$imageWrapper.find('img').height() - that.zoomStep*that.sizePercent;
      that.$imageWrapper.find('img').height(h).width(w)
    })
  }

  /**
   * 旋转图片
   * @param deg 要旋转的角度
   */
  rotate(deg){
    let that = this;
    that.deg += deg;
    let orgWidth = that.$imageWrapper.find('img').width();
    let orgHeight = that.$imageWrapper.find('img').height();
    // that.$imageWrapper.find('img').css({
    //   "height":`${orgWidth}px`,
    //   "width":`${orgHeight}px`,
    // });
    that.$imageWrapper.find('img').css({
      "transform-origin":'center',
      "transform": `rotate(${that.deg}deg)`
    })
  }

  bindLeft(){
    let that = this;
    that.$leftBtn.off('click').on('click',function () {
      that.rotate(90)
    })
  }

  bindRight(){
    let that = this;
    that.$rightBtn.off('click').on('click',function () {
      that.rotate(-90)
    })
  }

  load(path){
    if(!this.loaderInstance){
      this.init()
    }else {
      // 重置
      this.deg = 0;
      this.zoom = 1;
    }
    this.loaderInstance.load(path)
  }


}