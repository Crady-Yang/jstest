import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class Wechat extends ObjectValue{
  constructor(){
      super(0, '微信通知', 'wechat')
  }
}

class Sms extends ObjectValue{
  constructor(){
      super(1, '短信通知', 'sms')
  }
}


export class MessageTypeObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new Wechat())
      this.add(new Sms())
  }
}

export const MessageTypeObjectInstance = new MessageTypeObject()
