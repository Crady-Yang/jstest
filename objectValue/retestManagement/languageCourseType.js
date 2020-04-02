import { ObjectValue,ObjectValueCollection } from '../objectValueService'


class EnglishOne  extends ObjectValue{
  constructor(){
      super(1, '英语一', 'EnglishOne')
  }
}

class EnglishTwo extends ObjectValue{
  constructor(){
      super(2, '英语二','EnglishTwo')
  }
}
class Russian extends ObjectValue {
    constructor() {
        super(3, '俄语', 'Russian')
    }
}
class JapaneseOne extends ObjectValue {
    constructor() {
        super(4, '日语一', 'JapaneseOne')
    }
}

class JapaneseTwo extends ObjectValue {
    constructor() {
        super(5, '日语二', 'JapaneseTwo')
    }
}

export class languageCourseTypeObject extends ObjectValueCollection{
  constructor() {
    super();
      this.add(new EnglishOne());
      this.add(new EnglishTwo());
      this.add(new Russian());
      this.add(new JapaneseOne());
      this.add(new JapaneseTwo());
  }
}

export const languageCourseTypeObjectInstance = new languageCourseTypeObject();
