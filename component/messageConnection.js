import { GlobalEventName } from '../common/globalEventName'
import { getMessageUserKey } from '../controller/message'

let eventBus = memoryStore.get('globalEvent');

class MessageConnection {

  constructor(){
    this.socket = null;
    this.secret = null;
    let config = memoryStore.get('config');
    this.appKey = config.messageCenterAppKey;
    this.host = config.messageCenterHost;
    getMessageUserKey().then((v)=>{
      this.secret = v;
      this.socket = io(this.host);
      this.socket.emit('online',{
        secret:v,
        appKey:this.appKey
      });
      eventBus.trigger(GlobalEventName.MessageConnectionReady,[this]);
    })
  }
}

export const MessageConnectionSocket = new MessageConnection();