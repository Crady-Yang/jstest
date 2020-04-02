import { ObjectValue,ObjectValueCollection } from '../objectValueService'

class Allow extends ObjectValue{
  constructor(){
    super(1,'允许','allow')
  }
}


class NoAssign extends ObjectValue{
  constructor(){
      super(-1, '无权限','noAssign')
  }
}

class Forbidden extends ObjectValue{
  constructor(){
    super(0,'禁用','forbidden')
  }
}

export class PermitTypeObject extends ObjectValueCollection{
  constructor() {
    super();
    this.add(new Allow());
      this.add(new NoAssign());
    this.add(new Forbidden());
  }
}

export const PermitTypeObjectInstance = new PermitTypeObject();
