import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class ActionType extends ObjectValue{
  constructor(){
    super(0,'接口','action')
  }
}

class PageType extends ObjectValue{
  constructor(){
      super(1, '页面','page')
  }
}


export class ResourceTypeObject extends ObjectValueCollection{
  constructor() {
    super()
    this.add(new ActionType())
    this.add(new PageType())
  }
}

export const ResourceTypeObjectInstance = new ResourceTypeObject()
