import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class NoEntered  extends ObjectValue{
  constructor(){
      super(0, '未录入成绩', 'NoEntered')
  }
}

class Admission extends ObjectValue{
  constructor(){
      super(1, '拟录取','Admission')
  }
}
class NotAdmmited extends ObjectValue {
    constructor() {
        super(2, '未录取', 'NotAdmmited')
    }
}



export class EnrollstatusObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new NoEntered())
      this.add(new Admission())
      this.add(new NotAdmmited())
  }
}

export const EnrollstatusObjectInstance = new EnrollstatusObject()
