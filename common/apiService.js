
function getDefaultApiType(name) {
    name = name.toLowerCase();
    if (name.indexOf('add') >= 0 || name.indexOf('create') >= 0) {
        return 'create'
    }
    if (name.indexOf('update') >= 0 || name.indexOf('edit') >= 0 || name.indexOf('enable') >= 0) {
        return 'update'
    }
    if (name.indexOf('delete') >= 0 || name.indexOf('remove') >= 0) {
        return 'destroy'
    }
    return 'read'
}

export class Api {
    /**
     * Api
     * @param key  method+url
     * @param opt
     */
    constructor(key,opt){
        if(!key){
            throw new Error(`Api key is required`)
        }
        opt = Object.assign({
            method: 'post',
            ifFilterScript: true,  //默认需要过滤script标签
            httpOpt: {
                'Content-Type': 'application/json',
                'responseType': 'json'
            }, //axios 配置对象
            type:getDefaultApiType(opt.url),
            responseType:'json'
        },opt);
        this.key = opt.key;
        this.url = opt.url;
        this.method = opt.method;
        this.ifFilterScript = opt.ifFilterScript;
        this.httpOpt = opt.httpOpt;
        this.type = opt.type;
        this.reqDto = opt.reqDto;
        this.resDto = opt.resDto;
        this.responseType = opt.responseType;
        if(this.type === 'read' && !this.resDto){
            // 加入默认的ResDto
            this.resDto = {
                createTime:{ type:'date' }
            }
        }
    }
}
