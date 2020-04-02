import { ObjectValue,ObjectValueCollection } from '../objectValueService'

class User extends ObjectValue{
  constructor(){
    super(0,'User','user')
  }
}


class Role extends ObjectValue{
  constructor(){
    super(1,'Role','role')
  }
}

class Group extends ObjectValue{
  constructor(){
    super(2,'Group','group')
  }
}


class OU extends ObjectValue{
  constructor(){
    super(3,'OU','ou')
  }
}

class Other extends ObjectValue{
  constructor(){
    super(4,'Other','other')
  }
}


class PermissionTargetTypeObject extends ObjectValueCollection{
  constructor() {
    super()
    this.add(new User())
    this.add(new Role())
    this.add(new OU())
    this.add(new Group())
    this.add(new Other())
  }
}


export const PermissionTargetTypeObjectInstance = new PermissionTargetTypeObject()
