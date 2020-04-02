import BaseKendoDataSource from './baseDataSource';
import { deepMerge} from '../common/deepMerge';
import { isKeyValue } from '../common/utils'
import { parseResponse } from '../common/httpHelper'

class TreeListDataSource extends BaseKendoDataSource{
  /**
   * TreeListDataSource
   * @param api
   * @param opt.parentIdField 指定parentId的值
   */
  constructor(api,opt){
    super(api,opt);
    this.dataSource = this.create()
  }

  validateParentId(value,list,parentIdKey){
    parentIdKey = parentIdKey || 'parentId'
    let thisParentId = value[parentIdKey]
    let t = _.filter(list,{ id:thisParentId })
    return t.length > 0
  }

  defaultRemoteOption(){
    let that = this;
    let opt = this.opt;
    let dto = this.api.resDto;
    let t = super.defaultRemoteOption(opt);
    let parentIdKey = this.opt.parentIdField || 'parentId';
    t = deepMerge(t,{
      schema:{
        model:{
          id:'id',
          parentId:parentIdKey,
          fields:{
           id:{field:'id',type:'string'},
           [parentIdKey]:{field:parentIdKey,type:'string',nullable: true},
          },
          expanded: true
        },
        data:function (res) {
          console.log('--------- TreeListDataSource data -------')
          //parentId = null的时候，kendo才会把数据作为顶级的数据展示出来，否则找不到顶级的数据，就会显示NO Data
          if(isKeyValue(res) && res.data && _.isArray(res.data)){
            res = res.data
          }
          if(isKeyValue(res) && res.list && _.isArray(res.list)){
            res = res.list
          }
          let t = res.map((v)=>{
            if(v[parentIdKey] === '00000000-0000-0000-0000-000000000000' || v[parentIdKey] === '0' || v[parentIdKey] === ''){
              v[parentIdKey] = null
            }
            //检测parentId是否存在，如果parentId不存在，就替换成null，否则这条数据就显示不出来了
            if(!that.validateParentId(v,res,parentIdKey)){
              v[parentIdKey] = null
            }
            return v
          });

          t = parseResponse(t,dto);

          return t
        }
      }
    },opt)
    console.log(t);
    return t
  }


  create(){
    return new kendo.data.TreeListDataSource(this.option)
  }
}


export { TreeListDataSource }
