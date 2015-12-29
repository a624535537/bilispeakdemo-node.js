var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var swig = require('swig');
var favicon = require('connect-favicons');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.use(favicon(__dirname + '/public/img/icons'));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',function(req,res){
    res.render('lt');
});//express 静态资源等设定


var net = require('net');
var client = new net.Socket();
var connectR = function (socket,roomid){
    client.connect(88,"livecmt.bilibili.com",function(){
     console.log("connect success");
      client.setEncoding('binary');
      var data=new Buffer(12);
      data.writeUInt16BE(0x101,0);
      data.writeUInt16BE(12,2);
        data.writeUInt32BE(roomid,4);
        data.writeUInt32BE(0,8);
        console.log(data);
      client.write(data);
});// 创建socket客户端，链接弹幕控制台，发送请求信息
client.on('data',function(data){
    var bdata = new Buffer(data, "binary");
    var index = bdata.readUInt16BE(0);
    console.log(index);
    if(index == 4){
    var jsonData = bdata.slice(4);
    var text = jsonData.toString('utf8');
    text = JSON.parse(text);
        var te = [];
        te = text.info;
        socket.emit('newmsg',te[1]);
        }//data格式 二进制：buffer<index  数据> index为4的时候是弹幕，从第5个到data末尾，弹幕json格式:{'info':[[好像是弹幕颜色],"弹幕正文",发送者信息等]}

});//弹幕绑定到newmsg事件并广播
client.disconnect = function() {
  console.log("disconnect");
  this.client.destory();
};//断开链接
}
server.listen(3001,function(){
    console.log('please open local:3001');
});//监听3001端口
io.on('connection',function(socket){
socket.emit('open');
    socket.on('roomid',function(msg){
       connectR(socket,msg);
    });
});//用户连上的时候就开启监听，用户输入roomid之后进行连接弹幕cmt，获取弹幕等操作
