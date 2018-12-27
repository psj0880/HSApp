var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/app');
var Schema=mongoose.Schema;
var appSchema=new Schema({
    phone:String,
    del:{
        type: Boolean,
        default: false
    },
    body: Object
});
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("Connected to mongoDB");
});

var Man = mongoose.model('man',appSchema);
var Dt = mongoose.model('dt',appSchema);

router.use(express.static(__dirname));

router.get('/', (req, res) => {
    res.render('guide', {no: 1});
});

router.get('/am', (req, res) => {
    if(req.query.id != undefined){
        Man.findOne({_id:req.query.id},function (err, man) {
            if (err) return console.error(err);
            if(man.del)
                res.redirect('/err?err=이미 삭제된 데이터 입니다.');
            else
                res.render('application form', {no: 3, json: man.body, id: man._id, phone: man.phone});
    })
    }else
        if(req.query.phone == undefined)
            res.redirect('/applogin');
        else
            res.render('application form', {no: 3, phone: req.query.phone});
});

router.get('/ad', (req, res) => {
    if(req.query.id != undefined){
        Dt.findOne({_id:req.query.id},function (err, dt) {
            if (dt.del)
                res.redirect('/err?err=이미 삭제된 데이터 입니다.');
            else
                res.render('dapplication form', {no: 3, json: dt.body, id: dt._id, phone: dt.phone});
        })
    }else
        if(req.query.phone == undefined)
            res.redirect('/applogin');
        else
            res.render('dapplication form', {no: 3, phone: req.query.phone});
});

router.get('/applogin', (req, res) => {
    res.render('application login', {no: 3, md: 'm'});
});

router.get('/search', (req, res) =>{
    if(Object.keys(req.query).length < 3)
        res.render('search page', {no: 2});
    else{
        var request = require("request");

        var options = {
            url: 'http://localhost:8080/dataCtl/dc',
            form: {
                'mode' : 'search',
                'kor' : req.query.name,
                'dad' : req.query.dad,
                'grd' : req.query.grd,
                'all' : '',
                'err' : 'false'
            },
            json: true
        };

        request.post(options, function (err, response, body){
            res.render('search page', {no: 2, json: body, name:req.query.name, dad:req.query.dad, grd:req.query.grd});
        });
    }
});

router.post('/search', (req, res) => {
    var request = require("request");
    var options = {
        url: 'http://localhost:8080/dataCtl/dc',
        form: {
            'mode' : 'bring',
            'id' : req.body.id
        },
        json: true
    };

    request.post(options, function (err, response, body){
        res.send(body);
    });
});

router.get('/download/:filename', (req,res) => {
    switch (req.params.filename) {
        case '收單紙_男子.pdf':
        case '收單紙_男子.xlsx':
        case'收單紙_男子.hwp':
        case '收單紙_男子.jpg':
        case '收單紙_女壻.pdf':
        case '收單紙_女壻.xlsx':
        case '收單紙_女壻.hwp':
        case '收單紙_女壻.jpg':
        case '작성예_男子.jpg':
        case '작성예_女壻.jpg':
            var filepath = path.join(__dirname, "download", req.params.filename);
            res.download(encodeURI(filepath));
            break;
        default:
            res.redirect('/err?err=잘 못된 다운로드 접근');
        break;
    }
});

router.post('/am', (req, res) => {
    var body = req.body;

    if(body.pnum == undefined){
        res.redirect('/err?err=휴대폰번호를 입력하지 않고 작성하셨습니다.');
        return;
    }
    if(body.ggrd == '' || body.ggrd_kor == '' || body.grd == '' || body.grd_kor == '' || body.dad == '' || body.dad_kor == '' || body.name == '' || body.kor == '' || body.writer == '' || body.phone == ''){
        res.redirect('/err?err=필수 기재 미입력');
        return;
    }

    if(body.id!=undefined){
        Man.findOne({_id:body.id},function (err, man) {
            if (err) return console.error(err);
            man.body=body;
            man.save(function (err) {
                if(err) console.error(err);
            });
        });
    }
    else{
        var man = new Man({phone:body.pnum, body: body});
        man.save(function (err) {
            if(err) console.error(err);
        });
    }

    var xl = require('excel4node');
    var wb = new xl.Workbook({
        defaultFont: {
            size: 11,
            name: '나눔고딕'
        }
    });
    var ws = wb.addWorksheet('sheet1');

    var gray = wb.createStyle({
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#d1d1d1'
        },
    });
    var head = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical:'top'
        }
    });
    var cont = wb.createStyle({
        font: {
            color: '#0000ff'
        },
        alignment: {
            horizontal: 'left',
            vertical: 'top'
        }
    });
    var topb = wb.createStyle({
        border: {
            top: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var rightb = wb.createStyle({
        border: {
            right: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var leftb = wb.createStyle({
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var bottomb = wb.createStyle({
        border: {
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var textForm = wb.createStyle({
        numberFormat: '@'
    });

    ws.column(1).setWidth(6.0);
    ws.column(2).setWidth(12.0);
    ws.column(3).setWidth(10.0);
    ws.column(4).setWidth(10.0);
    ws.column(5).setWidth(32.63);
    ws.row(19).setHeight(30.0);

    ws.cell(1,1,1,5).style(topb);
    ws.cell(2,1,2,5).style(bottomb);
    ws.cell(6,1,6,5).style(bottomb);
    ws.cell(10,1,10,5).style(bottomb);
    ws.cell(21,1,21,5).style(bottomb);

    ws.cell(1,1,21,1).style(leftb);
    ws.cell(1,2,21,2).style(rightb);
    ws.cell(1,5,21,5).style(rightb);

    ws.cell(1,1,2,1,true).string('구분').style(head);
    ws.cell(1,2).string('신규/개정').style(head);
    ws.cell(1,3).string(body.new).style(cont);
    ws.cell(2,2).string('문중').style(head);
    ws.cell(2,3).string(body.clan).style(cont);
    ws.cell(2,4).string(body.clan2).style(cont);

    ws.cell(3,1,6,1,true).string('작성').style(head);
    ws.cell(3,2).string('이름').style(head);
    ws.cell(3,3,3,5,true).string(body.writer).style(cont);
    ws.cell(4,2).string('H.P').style(head);
    ws.cell(4,3,4,5,true).string(body.phone).style(textForm).style(cont);
    ws.cell(5,2).string('집/사무실').style(head);
    ws.cell(5,3,5,5,true).string(body.tel).style(textForm).style(cont);
    ws.cell(6,2).string('주소').style(head);
    ws.cell(6,3,6,5,true).string(body.address).style(cont);

    ws.cell(7,1,10,1,true).string('연원').style(head);
    ws.cell(7,2).string('증조(曾祖)').style(head);
    ws.cell(7,3).string(body.ggrd).style(cont);
    ws.cell(7,4).string(body.ggrd_kor).style(cont);
    ws.cell(8,2).string('조부(祖父)').style(head);
    ws.cell(8,3).string(body.grd).style(cont);
    ws.cell(8,4).string(body.grd_kor).style(cont);
    ws.cell(9,2).string('생부(生父)').style(head);
    ws.cell(9,3).string(body.dad).style(cont);
    ws.cell(9,4).string(body.dad_kor).style(cont);
    ws.cell(9,5).string('의 '+body.odr).style(cont);
    ws.cell(10,2).string('계부(系父)').style(head);
    ws.cell(10,3).string(body.fdad).style(cont);
    ws.cell(10,4).string(body.fdad_kor).style(cont);
    if(body.fdad!='')
        ws.cell(10,5).string('의 '+body.odr2).style(cont);

    ws.cell(11,1,21,1,true).string('本人').style(head).style(bottomb);
    ws.cell(11,2).string('세(世)').style(head).style(gray);
    ws.cell(11,3).string(body.line).style(cont);
    ws.cell(12,2).string('보명(譜名)').style(head).style(gray);
    ws.cell(12,3).string(body.name).style(cont);
    ws.cell(12,4).string(body.kor).style(cont);
    ws.cell(13,2).string('별칭(別稱)').style(head).style(gray);
    ws.cell(13,3).string(body.alias).style(cont);
    ws.cell(13,4).string(body.alias_kor).style(cont);
    ws.cell(14,2).string('자(字)').style(head).style(gray);
    ws.cell(14,3).string(body.ja).style(cont);
    ws.cell(14,4).string(body.ja_kor).style(cont);
    ws.cell(15,2).string('호(號)').style(head).style(gray);
    ws.cell(15,3).string(body.ho).style(cont);
    ws.cell(15,4).string(body.ho_kor).style(cont);
    ws.cell(16,2).string('작위(爵位)').style(head).style(gray);
    ws.cell(16,3,16,5,true).string(body.honor).style(cont);
    ws.cell(17,2).string('생(生)').style(head).style(gray);
    ws.cell(17,3,17,5,true).string(body.birth).style(cont);
    ws.cell(18,2).string('졸(卒)').style(head).style(gray);
    ws.cell(18,3,18,5,true).string(body.death).style(cont);
    ws.cell(19,2).string('수(壽)').style(head).style(gray);
    ws.cell(19,3,19,5,true).string(body.age).style(cont);
    ws.cell(20,2).string('전기(傳記)').style(head).style(gray);
    ws.cell(20,3,20,5,true).string(body.record).style(cont);
    ws.cell(21,2).string('묘(墓)').style(head).style(gray);
    ws.cell(21,3,21,5,true).string(body.grave).style(cont);

    if(req.body.wife!=undefined)
        for(i = 0; i<req.body.wife.length; i++){
            ws.cell(28+i*7,1,28+i*7,5).style(bottomb);
            ws.cell(22+i*7,5,28+i*7,5).style(rightb);
            ws.cell(22+i*7,1,28+i*7,1,true).string('配位\n'+(i+1)).style(head).style(gray);
            ws.cell(22+i*7,2).string('관향(貫鄕)').style(head).style(gray);
            ws.cell(22+i*7,3).string(body.wife[i].family).style(cont);
            ws.cell(23+i*7,2).string('보명(譜名)').style(head).style(gray);
            ws.cell(23+i*7,3).string(body.wife[i].name).style(cont);
            ws.cell(24+i*7,2).string('친정이력').style(head).style(gray);
            ws.cell(24+i*7,3,24+i*7,5,true).string(body.wife[i].info).style(cont);
            ws.cell(25+i*7,2).string('생(生)').style(head).style(gray);
            ws.cell(25+i*7,3,25+i*7,5,true).string(body.wife[i].birth).style(cont);
            ws.cell(26+i*7,2).string('졸(卒)').style(head).style(gray);
            ws.cell(26+i*7,3,26+i*7,5,true).string(body.wife[i].death).style(cont);
            ws.cell(27+i*7,2).string('수(壽)').style(head).style(gray);
            ws.cell(27+i*7,3,27+i*7,5,true).string(body.wife[i].age).style(cont);
            ws.cell(28+i*7,2).string('묘(墓)').style(head).style(gray);
            ws.cell(28+i*7,3,28+i*7,5,true).string(body.wife[i].grave).style(cont);
        }

    wb.writeToBuffer().then(function (buffer) {
        var fs = require('fs-extra');
        var filename=body.ggrd+'_'+body.grd+'_'+body.dad+'_'+(body.fdad==''?'':body.fdad+'_')+body.name+'_'+body.pnum;
        var date=new Date();
        var pathString = path.join('/home', 'node', 'application', 'man',  filename + '.xlsx');
        fs.outputFile(pathString, buffer);
    });

    res.redirect('/success?phone='+body.pnum);
});

router.post('/delman', (req, res) => {
    Man.findOne({_id:req.body.id},function (err, man) {
        if (err) return console.error(err);
        man.del=true;
        man.save(function (err) {
            if(err) console.error(err);
        });
    });
    /*Man.deleteOne({_id:req.body.id}, function (err) {
        if(err) {
            console.error(err);
        }
    });*/
    res.send('1');
});

router.post('/deldt', (req, res) => {
    Dt.findOne({_id:req.body.id},function (err, dt) {
        if (err) return console.error(err);
        dt.del=true;
        dt.save(function (err) {
            if(err) console.error(err);
        });
    });
    /*Dt.deleteOne({_id:req.body.id}, function (err) {
        if(err) {
            console.error(err);
        }
    });*/
    res.send('1');
});

router.post('/ad', (req, res) => {
    var body = req.body;

    if(body.pnum == undefined){
        res.redirect('/err?err=휴대폰번호를 입력하지 않고 작성하셨습니다.');
        return;
    }

    if(body.ggrd == '' || body.ggrd_kor == '' || body.grd == '' || body.grd_kor == '' || body.dad == '' || body.dad_kor == '' || body.name == '' || body.kor == '' || body.writer == '' || body.phone == ''){
        res.redirect('/err?err=필수 기재 미입력');
        return;
    }

    if(body.id!=undefined){
        Dt.findOne({_id:body.id},function (err, dt) {
            if (err) return console.error(err);
            dt.body=body;
            dt.save(function (err) {
                if(err) console.error(err);
            });
        });
    }
    else{
        var dt = new Dt({phone:body.pnum, body: body});
        dt.save(function (err) {
            if(err) console.error(err);
        });
    }

    var xl = require('excel4node');
    var wb = new xl.Workbook({
        defaultFont: {
            size: 11,
            name: '나눔고딕'
        }
    });
    var ws = wb.addWorksheet('sheet1');

    var gray = wb.createStyle({
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#d1d1d1'
        },
    });
    var head = wb.createStyle({
        alignment: {
            horizontal: 'center',
            vertical:'top'
        }
    });
    var cont = wb.createStyle({
        font: {
            color: '#0000ff'
        },
        alignment: {
            horizontal: 'left',
            vertical: 'top'
        }
    });
    var topb = wb.createStyle({
        border: {
            top: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var rightb = wb.createStyle({
        border: {
            right: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var leftb = wb.createStyle({
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var bottomb = wb.createStyle({
        border: {
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        }
    });
    var textForm = wb.createStyle({
        numberFormat: '@'
    });

    ws.column(1).setWidth(6.0);
    ws.column(2).setWidth(12.0);
    ws.column(3).setWidth(10.0);
    ws.column(4).setWidth(10.0);
    ws.column(5).setWidth(32.63);

    ws.cell(1,1,1,5).style(topb);
    ws.cell(2,1,2,5).style(bottomb);
    ws.cell(6,1,6,5).style(bottomb);
    ws.cell(10,1,10,5).style(bottomb);
    ws.cell(15,1,15,5).style(bottomb);
    ws.cell(19,1,19,5).style(bottomb);

    ws.cell(1,1,19,1).style(leftb);
    ws.cell(1,2,19,2).style(rightb);
    ws.cell(1,5,19,5).style(rightb);

    ws.cell(1,1,2,1,true).string('구분').style(head);
    ws.cell(1,2).string('신규/개정').style(head);
    ws.cell(1,3).string(body.new).style(cont);
    ws.cell(2,2).string('문중').style(head);
    ws.cell(2,3).string(body.clan).style(cont);
    ws.cell(2,4).string(body.clan2).style(cont);

    ws.cell(3,1,6,1,true).string('작성').style(head);
    ws.cell(3,2).string('이름').style(head);
    ws.cell(3,3,3,5,true).string(body.writer).style(cont);
    ws.cell(4,2).string('H.P').style(head);
    ws.cell(4,3,4,5,true).string(body.phone).style(textForm).style(cont);
    ws.cell(5,2).string('집/사무실').style(head);
    ws.cell(5,3,5,5,true).string(body.tel).style(textForm).style(cont);
    ws.cell(6,2).string('주소').style(head);
    ws.cell(6,3,6,5,true).string(body.address).style(cont);

    ws.cell(7,1,10,1,true).string('연원').style(head);
    ws.cell(7,2).string('증조(曾祖)').style(head);
    ws.cell(7,3).string(body.ggrd).style(cont);
    ws.cell(7,4).string(body.ggrd_kor).style(cont);
    ws.cell(8,2).string('조부(祖父)').style(head);
    ws.cell(8,3).string(body.grd).style(cont);
    ws.cell(8,4).string(body.grd_kor).style(cont);
    ws.cell(9,2).string('생부(生父)').style(head);
    ws.cell(9,3).string(body.dad).style(cont);
    ws.cell(9,4).string(body.dad_kor).style(cont);
    ws.cell(9,5).string('의 '+body.odr).style(cont);
    ws.cell(10,2).string('계부(系父)').style(head);
    ws.cell(10,3).string(body.fdad).style(cont);
    ws.cell(10,4).string(body.fdad_kor).style(cont);
    if(body.fdad!='')
        ws.cell(10,5).string('의 '+body.odr2).style(cont);

    ws.cell(11,1,15,1,true).string('本人').style(head);
    ws.cell(11,2).string('보명(譜名)').style(head).style(gray);
    ws.cell(11,3).string(body.name).style(cont);
    ws.cell(11,4).string(body.kor).style(cont);
    ws.cell(12,2).string('별칭(別稱)').style(head).style(gray);
    ws.cell(12,3).string(body.alias).style(cont);
    ws.cell(12,4).string(body.alias_kor).style(cont);
    ws.cell(13,2).string('작위(爵位)').style(head).style(gray);
    ws.cell(13,3,13,5,true).string(body.honor).style(cont);
    ws.cell(14,2).string('생(生)').style(head).style(gray);
    ws.cell(14,3,14,5,true).string(body.birth).style(cont);
    ws.cell(15,2).string('졸(卒)').style(head).style(gray);
    ws.cell(15,3,15,5,true).string(body.death).style(cont);
    ws.cell(16,1,19,1,true).string('사위').style(head).style(bottomb);
    ws.cell(16,2).string('이름(壻名)').style(head).style(gray);
    ws.cell(16,3).string(body.hus).style(cont);
    ws.cell(16,4).string(body.hus_kor).style(cont);
    ws.cell(17,2).string('본관성씨').style(head).style(gray);
    ws.cell(17,3).string(body.family).style(cont);
    ws.cell(18,2).string('씨가이력').style(head).style(gray);
    ws.cell(18,3,18,5,true).string(body.info).style(cont);
    ws.cell(19,2).string('자녀(子女)').style(head).style(gray);
    ws.cell(19,3,19,5,true).string(body.child).style(cont);

    wb.writeToBuffer().then(function (buffer) {
        var fs = require('fs-extra');
        var filename=body.ggrd+'_'+body.grd+'_'+body.dad+'_'+(body.fdad==''?'':body.fdad+'_')+body.name+'_'+body.pnum;
        var date=new Date();
        var pathString = path.join('/home', 'node', 'application', 'daughter',  filename + '.xlsx');
        fs.outputFile(pathString, buffer);
    });
    res.redirect('/success?phone='+body.pnum);
});

router.post('/login', (req, res) => {
    var regExp = /^\d{10,11}$/;
    if(regExp.test(req.body.phone)){
        res.render('app list', {no: 3, phone: req.body.phone});
    }else{
        res.redirect('/err?err=전화번호 오류');
    }
});

router.post('/listup', (req, res) => {
    Man.find({phone:req.body.phone, del:false},function (err, man) {
        if (err) return console.error(err);
        Dt.find({phone:req.body.phone, del:false},function (err, dt) {
            if (err) return console.error(err);
            res.render('makelist', {man: man, dt: dt, phone:req.body.phone});
        });
    });
});

router.get('/mail', (req, res) => {
    res.render('mail app', {no: 4});
});

router.get('/success', (req,res)=>{
    res.render('success', {no: 3, phone: req.query.phone});
});

router.get('/err', (req,res)=>{
    res.render('error', {err:req.query.err});
});

router.get('/admin', (req,res)=>{
    res.render('admin login');
});

router.post('/admin', (req,res)=>{
    if(req.body.pw == 'hs1001')
        res.render('admin');
    else
        res.send('-1');
});

module.exports = router;