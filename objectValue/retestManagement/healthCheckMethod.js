import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class DesignatedHospital  extends ObjectValue{
  constructor(){
      super(1, '定点医院', 'DesignatedHospital')
  }
}

class Self extends ObjectValue{
  constructor(){
      super(2, '自行体检', 'Self')
  }
}


export class HealthCheckMethodObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new DesignatedHospital())
      this.add(new Self())
  }
}

export const HealthCheckMethodObjectInstance = new HealthCheckMethodObject()
