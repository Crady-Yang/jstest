import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class PoliticalIdeological  extends ObjectValue{
  constructor(){
      super(1, '思想政治理论', 'PoliticalIdeological')
  }
}

class ManagementJoint extends ObjectValue{
  constructor(){
      super(2, '管理类联考综合能力','ManagementJoint')
  }
}



export class politicalCourseTypeObject extends ObjectValueCollection{
  constructor() {
    super();
      this.add(new PoliticalIdeological());
      this.add(new ManagementJoint());
  }
}

export const politicalCourseTypeObjectInstance = new politicalCourseTypeObject();
