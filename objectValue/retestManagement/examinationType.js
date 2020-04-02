import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class Volunteer  extends ObjectValue{
  constructor(){
      super(0, '一志愿', 'volunteer')
  }
}

class Adjustment extends ObjectValue{
  constructor(){
      super(1, '调剂','adjustment')
  }
}


export class ExaminationTypeObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new Volunteer())
      this.add(new Adjustment())
  }
}

export const ExaminationTypeObjectInstance = new ExaminationTypeObject()
