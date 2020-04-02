import { GlobalStoreKey } from './globalStoreKey'

export class ErrorMessageCenter {

  /**
   * add
   * @param data.id
   * @param data.title
   * @param data.message
   */
  static add(data){
    let list = store.get(GlobalStoreKey.ErrorMessageStore) || [];
    let userEmail = Cookies.get('userEmail');
    // 未登录状态不记录错误
    if(!userEmail || userEmail === ''){
      return
    }
    list.push(Object.assign({
      logTime:moment().format('YYYY-MM-DD HH:mm:ss'),
      url:window.location.href,
      email:userEmail
    },data));
    store.set(GlobalStoreKey.ErrorMessageStore,list);
    console.log(list)
  }

  static remove(id){
    let list = store.get(GlobalStoreKey.ErrorMessageStore) || [];
    let newList = _.remove(list,(v)=>{
      return v.id !== id
    });
    store.set(GlobalStoreKey.ErrorMessageStore,newList);
    console.log(newList)
  }

  static removeAll(){
    let userEmail = Cookies.get('userEmail');
    let list = store.get(GlobalStoreKey.ErrorMessageStore) || [];
    let newList = _.remove(list,(v)=>{
      return v.email !== userEmail
    });
    store.set(GlobalStoreKey.ErrorMessageStore,newList)
  }

  // 获取本机当前用户的消息
  static getAllCurrent(){
    let list = store.get(GlobalStoreKey.ErrorMessageStore) || [];
    let userEmail = Cookies.get('userEmail');
    let newList = _.filter(list,{ email:userEmail });
    return newList
  }

  static getById(id){
    let list = store.get(GlobalStoreKey.ErrorMessageStore) || [];
    for(let i=0;i<list.length;i++){
      if(list[i].id === id){
        return list[i]
      }
    }
    return null
  }

}