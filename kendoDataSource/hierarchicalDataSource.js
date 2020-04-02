import BaseKendoDataSource from './baseDataSource'

class HierarchicalDataSource extends BaseKendoDataSource{
  constructor(api,opt){
    super(api,opt)

    this.dataSource = this.create()
  }

  create(){
    //kendo.data.HierarchicalDataSource.prototype.getTopParent = this.getTopParent
    //kendo.data.HierarchicalDataSource.prototype.getDirectParent = this.getDirectParent
    return new kendo.data.HierarchicalDataSource(this.option)
  }

  /**
   * 获取顶级父级对象
   * @param id
   */
  getTopParent(id){

  }

  /**
   * 获取最近的父级对象
   * @param id
   */
  getDirectParent(id){}
}


export { HierarchicalDataSource }
