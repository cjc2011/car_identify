var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var logger = require('morgan');
var axios = require('axios');
var uuid = require('node-uuid');
var fs = require('fs');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//判断请求体格式是不是json格式，如果是的话会调用JSON.parse方法把请求体字符串转成对象
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', indexRouter);

// 图片识别
var AipOcrClient = require("baidu-aip-sdk").ocr;

// 设置APPID/AK/SK
var APP_ID = "11442294";
var API_KEY = "2OhFsp1NkY5AkbPXQwUZvkys";
var SECRET_KEY = "vtVq6ZnEtoYKUUoYAlc3g5b1x5dW8O5k";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

// 身份证识别
app.post('/idcard_identify',function(req,res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var path = files.file.path
    // 身份证识别
    var idCardImage = fs.readFileSync(path).toString("base64");
    var imageName = files.file.name
    var ID = uuid.v1().split('-').join('')
    var imagePath = `./public/images/${ID}${imageName}` 
    fs.writeFile(imagePath, idCardImage, 'base64', function(err){})
    var idCardSide = "front";
    client.idcard(idCardImage,idCardSide).then(function(result) {
      result.imagePath = `images/${ID}${imageName}`
      res.json(result)
    }).catch(function(err) {
      // 如果发生网络错误
      res.json(err)
    });
  });
  // 
});

// 驾驶证识别drivingLicense
app.post('/drivi_identify',function(req,res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var path = files.file.path
    // 驾驶证识别drivingLicense
    var drivinglicenseImage = fs.readFileSync(path).toString("base64")
    var imageName = files.file.name
    var ID = uuid.v1().split('-').join('')
    var imagePath = `./public/images/${ID}${imageName}`
    fs.writeFile(imagePath, drivinglicenseImage, 'base64', function(err){})

    client.drivingLicense(drivinglicenseImage).then(function(result) {
      result.imagePath = `images/${ID}${imageName}`
      res.json(result)
    }).catch(function(err) {
        // 如果发生网络错误
        res.json(err)
    });
  });
});

//行驶证
app.post('/vehicle_identify',function(req,res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var path = files.file.path
    // 行驶证识别vehicle_identify
    var vehicleImage = fs.readFileSync(path).toString("base64")
    var imageName = files.file.name
    var ID = uuid.v1().split('-').join('')
    var imagePath = `./public/images/${ID}${imageName}` 
    fs.writeFile(imagePath, vehicleImage, 'base64', function(err){})

    client.vehicleLicense(vehicleImage).then(function(result) {
      console.log(`images/${ID}${imageName}`)
      result.imagePath = `images/${ID}${imageName}`
      res.json(result)
    }).catch(function(err) {
        // 如果发生网络错误
        res.json(err)
    });
  });
});

// 商户渠道
app.get('/channel', function(req, res) {
  axios.get('http://admin.809qu.com/index.php?m=Api&a=qudao').then((data) => {
    res.json(data.data)
  })
})

// 发送用户数据
app.get('/carData', function(req, res) {
  let data = req.query
  axios.get('http://admin.809qu.com/index.php?m=Api&a=Order', {
    params: data
  }).then((json) => {
    res.json(json.data)
  })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
