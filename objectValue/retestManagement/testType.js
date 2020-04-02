import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class Interview  extends ObjectValue{
  constructor(){
      super(1, '面试', 'interview', {
          color: "var(--green-light)"
      })
  }
}

class WrittenExamination extends ObjectValue{
  constructor(){
      super(0, '笔试', 'writtenExamination', {
          color: "var(--main-l)"
      })
  }
}

export class TestTypeObject extends ObjectValueCollection{
  constructor() {
    super()
      this.add(new Interview())
      this.add(new WrittenExamination())
  }
}

export const TestTypeObjectInstance = new TestTypeObject()
