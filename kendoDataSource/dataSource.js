import BaseKendoDataSource from './baseDataSource'

class DataSource extends BaseKendoDataSource{
  constructor(api,option){
    super(api,option)
    this.dataSource = this.create()
  }

  create(){
    console.log('-------- DataSource -------');
    console.log(this.option);
    return new kendo.data.DataSource(this.option)
  }
}


export { DataSource }
