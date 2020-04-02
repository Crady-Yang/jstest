import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class PreliminaryResult  extends ObjectValue{
  constructor(){
      super(0, '初审结果', 'preliminaryResult', { "color":"var(--warn-l)"})
  }
}

class ExaminationArrange  extends ObjectValue{
  constructor(){
      super(1, '复试安排', 'examinationArrange', { "color": "var(--tea-m)" })
  }
}
class ExaminationResult extends ObjectValue {
    constructor() {
        super(2, '复试结果', 'examinationResult', { "color": "var(--success)" })
    }
}
class Other  extends ObjectValue {
    constructor() {
        super(3, '其他', 'other', { "color": "var(--blue)" })
    }
}


export class MessageNodeObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new PreliminaryResult())
      this.add(new ExaminationArrange())
      this.add(new ExaminationResult())
      this.add(new Other())
  }
}

export const MessageNodeObjectInstance = new MessageNodeObject()
