import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class WaitAudit  extends ObjectValue{
  constructor(){
      super(1, '待审核', 'WaitAudit', { "color": "var(--blue)" })
  }
}

class DataUpdate extends ObjectValue{
  constructor(){
      super(2, '资料更新', 'DataUpdate', { "color": "var(--tea-m)" })
  }
}
class AuditFailed extends ObjectValue {
    constructor() {
        super(3, '审核失败', 'AuditFailed', { "color": "var(--warn-l)" })
    }
}
class AuditPass extends ObjectValue {
    constructor() {
        super(4, '审核通过', 'AuditPass', { "color": "var(--success)" })
    }
}


export class ApplicationStatusObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new WaitAudit())
      this.add(new AuditPass())
      this.add(new AuditFailed())
      this.add(new DataUpdate())

  }
}

export const ApplicationStatusObjectInstance = new ApplicationStatusObject()
