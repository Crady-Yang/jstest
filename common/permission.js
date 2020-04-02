import { queryUserRole } from '../controller/user'


export function isSystemRole() {
  let userId = Cookies.get('userId');
  let userEmail = Cookies.get('userEmail');
  let configData = memoryStore.get('config');
  let systemEmail = configData.systemEmail;
  let systemRoleName = configData.systemRoleName;
  if(userEmail === systemEmail){
    return Promise.resolve(true)
  }
  return queryUserRole({ userId }).then((data)=>{
    for(let i=0;i<data.length;i++){
      if(data[i].roleName === systemRoleName){
        return true
      }
    }
    return false
  })
}