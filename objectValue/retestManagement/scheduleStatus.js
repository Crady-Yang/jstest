import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class WaitWrittenExamination  extends ObjectValue{
  constructor(){
      super(1, '待安排笔试', 'WaitWrittenExamination')
  }
}

class WaitInterview extends ObjectValue{
  constructor(){
      super(2, '待安排面试', 'WaitInterview')
  }
}


export class ScheduleStatusObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new WaitWrittenExamination())
      this.add(new WaitInterview())
  }
}

export const ScheduleStatusObjectInstance = new ScheduleStatusObject()
