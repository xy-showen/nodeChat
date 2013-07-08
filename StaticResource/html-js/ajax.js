/*
Title: [Ajax.js简介]
文件名: ajax.js
版本:v1.0.0-100
版权:(c)Baidu.com
作者:chenlin
简介:
>    这个文件是对xmlhttp异步请求进行了简单的封装，
>    主要是将prototytp进行了简化，如果要使用复杂的功能可以使用prototype的ajax.js
>    外部使用时，主要调用方式为
>    var myAjax=new Ajax.Request(
>          url,
>          {
>                method: 'get',
>                asynchronous: true,
>                onSuccess: function(xmlHttp)
>                {             
>                },
>                onFailure:function(xmlHttp){
>                },
>                onException:function(exception){
>                }
>          }
>      ); 
>      另可使用myAjax.header()和myAjax.evalResponse();
>      其他的都为内部调用函数，外部尽量不要使用。Class: Ajax.Request类
*/
Function.prototype.bind = function(object) {
  var __method = this;
  return function() {
    __method.apply(object, arguments);
  }
};
/*
基础ajax类
>    封装了一个函数：Ajax.getTransport()返回一个xmlhttp对象
>    这个类里的函数一般不使用。
*/
var Ajax = {
    getTransport: function() {
        return Try.these(
            function() {return new ActiveXObject('Msxml2.XMLHTTP')},
            function() {return new ActiveXObject('Microsoft.XMLHTTP')},
            function() {return new XMLHttpRequest()}
        ) || false;
    }
};
/*
基础ajax.base类
>    封装了三个函数：
>    setOptions：设置进行ajax请求的参数
>    responseIsSuccess：判断异步请求返回是否成功
>    responseIsFailure：判断异步请求返回是否失败
>    这个类里的函数也没有必要在实际中使用，只有在扩展是才会使用到
*/
Ajax.Base = function() {};
Ajax.Base.prototype = {
  setOptions: function(options) {
    this.options = {
      method:       'post',//异步请求方法，可以为get和post，此处为默认post
      asynchronous: true,  //设置是否为异步方式发送，
      parameters:   ''     //传递参数，参数都是url编码格式a=valueOfA&b=valueOfB
    }
    Object.extend(this.options, options || {});//以上三个属性为异步请求的基本属性。
  },
  responseIsSuccess: function() {
    return this.transport.status == undefined
        || this.transport.status == 0 
        || (this.transport.status >= 200 && this.transport.status < 300);
  },
  responseIsFailure: function() {
    return !this.responseIsSuccess();
  }
};
/*
* 生成一个类Ajax.Request
*/
Ajax.Request = new Class();
/*
定义了xmlhttp请求的状态。
>    0 (未初始化) 对象已建立，但是尚未初始化（尚未调用open方法） 
>    1 (初始化) 对象已建立，尚未调用send方法 
>    2 (发送数据) send方法已调用，但是当前的状态及http头未知 
>    3 (数据传送中) 已接收部分数据，因为响应及http头不全，这时通过responseBody和responseText获取部分数据会出现错误， 
>    4 (完成) 数据接收完毕,此时可以通过通过responseBody和responseText获取完整的回应数据 
*/
Ajax.Request.Events =  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
/*
*Ajax.Request对象，需要实例化对象，
*
*/
Ajax.Request.prototype = Object.extend(new Ajax.Base(),{
  initialize: function(url, options) {
    this.transport = Ajax.getTransport();        //返回xmlhttp对象
    this.setOptions(options);                    //设置请求的参数，在初始化时写
    this.request(url);                            //进行异步请求
  },
  request: function(url) {
    var parameters = this.options.parameters || '';
    if (parameters.length > 0) parameters += '&_=';
    try {
      this.url = url;
      /*
      * 如果是get方法的化，就将parameters里的内容添加到url里
      */
      if (this.options.method == 'get' && parameters.length > 0)
        this.url += (this.url.match(/?/) ? '&' : '?') + parameters;
      /*
      *    调用xmlhttp的请求函数，进行请求
      */
      this.transport.open(this.options.method, this.url, 
          this.options.asynchronous);
      /*
      * 如果是异步请求，对onreadystatechange绑定函数，对于为什么要用定时器，没10ms将状态设为Loading，我也没有明白。
      */
      if (this.options.asynchronous) {
        this.transport.onreadystatechange = this.onStateChange.bind(this);
        setTimeout((function() {this.respondToReadyState(1)}).bind(this), 10);
      }
     this.setRequestHeaders();                    //设置请求里的头部信息，包括编码等信息
      /*
      * 对与post方式请求，也可以通过options里的postBody来设，这里就将postbody放到参数里进行传递
      */
      var body = this.options.postBody ? this.options.postBody : parameters;
      /*
      *    发送post数据
      */
      this.transport.send(this.options.method == 'post' ? body : null);
    } catch (e) {
      this.dispatchException(e);
    }
   },
    setRequestHeaders: function() {
    var requestHeaders =  ['X-Requested-With', 'XMLHttpRequest'];
    if (this.options.method == 'post') {
      requestHeaders.push('Content-type', 
        'application/x-www-form-urlencoded');
      /* Force "Connection: close" for Mozilla browsers to work around
       * a bug where XMLHttpReqeuest sends an incorrect Content-length
       * header. See Mozilla Bugzilla #246651. 
       */
      if (this.transport.overrideMimeType)
        requestHeaders.push('Connection', 'close');
    }
    if (this.options.requestHeaders)
      requestHeaders.push.apply(requestHeaders, this.options.requestHeaders);
    for (var i = 0; i < requestHeaders.length; i += 2)
      this.transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
  },
/*
* 状态改变时，执行respondToReadyState，判断当状态为1时不执行。
*/
  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState != 1)
      this.respondToReadyState(this.transport.readyState);
  },
 /*
  * 返回异步请求返回文件的头部信息，name表示名字，函数返回参数值
  */
  header: function(name) {
    try {
      return this.transport.getResponseHeader(name);
    } catch (e) {}
  },
  /*
  *如果返回header信息里包括X-JSON/xxx，则会执行xxx的内容
  *不是很明白这里，为什么要eval
  */
  evalJSON: function() {
    try {
      return eval(this.header('X-JSON'));
    } catch (e) {}
  },
  /*
  * 很简单的函数，如果返回Content-type为text/javascript，则会调用此函数进行执行，我认为这处用途不大
  */
  evalResponse: function() {
    try {
      return eval(this.transport.responseText);
    } catch (e) {
      this.dispatchException(e);
    }
  },
  /*
  *根据返回的状态决定该执行的步骤
  */
  respondToReadyState: function(readyState) {
    var event = Ajax.Request.Events[readyState];
    var transport = this.transport, json = this.evalJSON();
    if (event == 'Complete') {
        /*
        *此处如果状态处于完成状态则会进行分析分别调用onSuccess和onFailure，所以一般onComplete不调用为好
        */
      try {
        (this.options['on' + this.transport.status]
         || this.options['on' + (this.responseIsSuccess() ? 'Success' : 'Failure')]
         || function(){})(transport, json);
      } catch (e) {
        this.dispatchException(e);
      }
      /*
      * 此处对返回js进行了eval
      */
      if ((this.header('Content-type') || '').match(/^text/javascript/i))
        this.evalResponse();
    }
    try {
      (this.options['on' + event] || function(){})(transport, json);
    } catch (e) {
      this.dispatchException(e);
    }
    /* 
    * Avoid memory leak in MSIE: clean up the oncomplete event handler
    */
    if (event == 'Complete')
      this.transport.onreadystatechange = function(){};
  },
  /*
  *错误时调用，一般外部使用onException:function(){}
  */
  dispatchException: function(exception) {
    (this.options.onException || function(){})(this, exception);
  }
  }
 );