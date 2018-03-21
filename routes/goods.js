var express = require('express');
var router = express.Router();
var User = require('./../models/users');

var db = require('../db');
var Goods = require('../models/goods');

db.createConnection();

// 获取商品列表接口
router.get('/list',function (req,res,next) {
    let page = parseInt(req.param("page"));
    let pageSize = parseInt(req.param('pageSize'));
    let priceLevel = req.param('priceLevel');
    let sort = req.param("sort");
    let params = {};
    let skip = (page - 1)*pageSize;
    let priceGt = '',priceLte = '';
    if (priceLevel != 'all'){
        switch (priceLevel) {
            case '0':priceGt=0;priceLte=500;break;
            case '1':priceGt=500;priceLte=1000;break;
            case '2':priceGt=1000;priceLte=2000;break;
            case '3':priceGt=2000;priceLte=3000;break;
            case '4':priceGt=3000;priceLte=999999999999;break;
        }
        params = {
            salePrice:{
                $gt:priceGt,
                $lte:priceLte
            }
        }
    }
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);

    goodsModel.sort({'salePrice':sort});

    goodsModel.exec(function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message
            })
        }else{
            res.json({
                status:'0',
                msg:'',
                result:{
                    count:doc.length,
                    list:doc,
                }
            })
        }
    })
});

//加入购物车接口
router.post("/addCart",function(req,res,next){
    var _id = req.cookies._id,productId = req.body.productId;// post 和 get 取参 不同 分别为 req.body 和 req.param

    User.findOne({_id:_id},function(err,userDoc){
        if(err){
            res.json({
                status:"1",
                msg:err.message
            })
        }else{
            if(userDoc){
                let goodsItem = '';
                userDoc.cartList.forEach(function(item){
                    if(item.productId == productId){
                        goodsItem = item;
                        item.productNum++;
                    };
                })
                if(goodsItem){
                    userDoc.save(function(error,doc2){
                        if(error){
                            res.json({
                                status:"1",
                                msg:error.message
                            })
                        }else{
                            res.json({
                                status:"0",
                                msg:"",
                                result:"suc"
                            })
                        }
                    })
                }else{
                    Goods.findOne({productId:productId},function(err,doc){
                        if(err){
                            res.json({
                                status:"1",
                                msg:err.message
                            })
                        }else{
                            if(doc){
                                doc.productNum = 1;
                                doc.checked = 1;
                                userDoc.cartList.push(doc);
                                userDoc.save(function(error,doc2){
                                    if(error){
                                        res.json({
                                            status:"1",
                                            msg:error.message
                                        })
                                    }else{
                                        res.json({
                                            status:"0",
                                            msg:"",
                                            result:"suc"
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    })
})


module.exports = router;