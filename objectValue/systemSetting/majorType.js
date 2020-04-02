import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class MasterScience extends ObjectValue{
  constructor(){
      super(0, '学术硕士', 'masterScience')
  }
}

class ProfessionalMaster extends ObjectValue{
  constructor(){
      super(1, '专业硕士','professionalMaster')
  }
}


export class MajorTypeObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new MasterScience())
      this.add(new ProfessionalMaster())
  }
}

export const MajorTypeObjectInstance = new MajorTypeObject()
