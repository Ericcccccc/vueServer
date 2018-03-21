var express = require('express');
var router = express.Router();
var Admin = require('../models/admins');
var Banner = require('../models/banners');
var uuid = require('uuid-v4');

var formidable = require('formidable');
var fs = require('fs');
var util = require('util')

// 后台登陆
router.post('/login', function (req, res, next) {
    var param = {
        adminName: req.body.adminUser,
        adminPwd: req.body.adminPwd
    };
    Admin.findOne(param, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                //往前端存入cookie
                res.cookie("admin_id", doc._id, {
                    path: "/",
                    maxAge: 1000 * 60 * 60
                });
                res.cookie("adminName", doc.adminName, {
                    path: "/",
                    maxAge: 1000 * 60 * 60
                });
                res.json({
                    status: "0",
                    msg: "",
                    result: {
                        adminName: doc.adminName
                    }
                })
            } else {
                res.json({
                    status: '120004',
                    msg: '用户不存在',
                    result: ''
                })
            }
        }
    })


});

// 检查后台是否登录
router.post('/checkLogin', function (req, res, next) {
    // console.log(req.cookies.admin_id)
    if (req.cookies.admin_id) {
        res.json({
            status: "0",
            msg: "",
            result: req.cookies.adminName || ''
        })
    } else {
        res.json({
            status: "1",
            msg: "当前未登录",
            result: ""
        })
    }
})


// 图片上传
router.post('/upload', function (req, res, next) {
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = './views/static/banner/'; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.locals.error = err;
            return
        }
        // console.log(files)

        fs.renameSync(files.file.path, form.uploadDir + files.file.name);

        var src = './static/banner/' + files.file.name;
        var id = uuid();
        Banner.find(function (err, doc) {
            if (err) {
                res.json({
                    status: '1',
                    msg: err.message,
                    result: ''
                })
            } else {
                if (doc) {
                    var params = {
                        title:'',
                        url: '',
                        src: src,
                        id: id,
                        sum:''
                    }
                    if (doc.length == 0) {
                        var newBanner = new Banner(params);
                        newBanner.save(function (err, doc) {
                            if (err) {
                                res.json({
                                    status: '1',
                                    msg: err.message,
                                    result: ''
                                })
                            } else {
                                res.json({
                                    status: '0',
                                    msg: '图片保存成功',
                                    result: {
                                        id: id
                                    }
                                })
                            }
                        })
                    } else {
                        doc.forEach((item) => {
                            if (item.src != src) {
                                var newBanner = new Banner(params);
                                newBanner.save(function (err, doc) {
                                    if (err) {
                                        res.json({
                                            status: '1',
                                            msg: err.message,
                                            result: ''
                                        })
                                    }
                                })
                            } else {
                                Banner.find({
                                    src: item.src
                                }, function (err, doc) {
                                    if (err) {
                                        res.json({
                                            status: '1',
                                            msg: err.message,
                                            result: ''
                                        })
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: '图片保存成功',
                                            result: {
                                                id: doc[0].id
                                            }
                                        })
                                    }
                                })
                            }
                        });
                    }
                }
            }
        })
    })
});

router.post('/addRecom', function (req, res, next) {
    var params = {
        title: req.body.title,
        url: req.body.url,
        sum: req.body.sum,
        id: req.body.id
    };
    console.log(params)

    Banner.find({id:params.id},function(err,doc){
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            console.log(doc)
            doc[0].update(params,function(err,doc){
                if(err){
                    res.json({
                        status: '1',
                        msg: err.message,
                        result: ''
                    })
                }else{
                    res.json({
                        status:'0',
                        msg:'推荐图添加成功',
                        result:''
                    })
                }
            }) 
        }
    })
})



module.exports = router;