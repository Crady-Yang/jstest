import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class FullTime  extends ObjectValue{
  constructor(){
      super(0, '全日制', 'FullTime')
  }
}

class PartTime extends ObjectValue{
  constructor(){
      super(1, '非全日制','PartTime')
  }
}


export class StudyTypeObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new FullTime())
      this.add(new PartTime())
  }
}

export const StudyTypeObjectInstance = new StudyTypeObject()
