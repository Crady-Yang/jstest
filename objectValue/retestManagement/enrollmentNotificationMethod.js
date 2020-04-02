import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class Mail  extends ObjectValue{
  constructor(){
      super(1, '邮寄', 'Mail')
  }
}

class Self extends ObjectValue{
  constructor(){
      super(2, '自取', 'Self')
  }
}


export class EnrollmentNotificationMethodObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new Mail())
      this.add(new Self())
  }
}

export const EnrollmentNotificationMethodObjectInstance = new EnrollmentNotificationMethodObject()
