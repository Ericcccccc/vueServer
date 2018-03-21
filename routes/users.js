var express = require('express');
var router = express.Router();
var User = require('./../models/users');
require('../util/dateFormat');
var uuid = require('uuid-v4');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//登录接口
router.post("/login",function(req,res,next){
   var param = {
       userName:req.body.userName,
       userPwd:req.body.userPwd
   }
    User.findOne(param,function(err,doc){
        if(err){
            res.json({
                status:"1",
                msg:err.message,
                result:''
            })
        }else{
            if(doc){
                // res里写cookie 前端才能拿到
                res.cookie("_id",doc._id,{
                    path:"/",
                    maxAge:1000*60*60
                });
                res.cookie("userName",doc.userName,{
                    path:"/",
                    maxAge:1000*60*60
                });
                // 写session需要在req里面写
                // req.session.user = doc;
                res.json({
                    status:"0",
                    msg:"",
                    result:{
                        userName:doc.userName
                    }
                })
            }else{
                res.json({
                    status:"1",
                    msg:"用户名或者密码错误",
                    result:''
                })
            }
        }
    })
});

// 注册接口
router.post('/registe',function(req,res,next){
    var param = {
        userName:req.body.userName,
        userPwd:req.body.userPwd,
    };
    var isRegiste = true;
    User.find(function(err,doc){
        if(err){
            return res.json({
                status:'1',
                msg:err.message,
                result:''
            })
        }else{
            doc.forEach((item)=>{
                if(item.userName == param.userName){
                    isRegiste = false;
                }
            })
            if(!isRegiste){
                return res.json({
                    status:'120003',
                    msg:'此用户名已被注册',
                    result:''
                })
            }else{
                var newUser = new User(param);
                newUser.save(function(err,doc){
                    if(err){
                        return res.json({
                            status:'1',
                            msg:err.message,
                            result:''
                        })
                    }else{
                        return res.json({
                            status:'0',
                            msg:'注册成功',
                            result:''
                        })
                    }
                })
            }
        }
    })
})

//退出接口
router.post("/logout",function(req,res,next){
    res.cookie("_id","",{
        path:"/",
        maxAge:-1
    })
    res.cookie("userName","",{
        path:"/",
        maxAge:-1
    })
    res.json({
        status:"0",
        msg:"",
        result:""
    })
})

//检查是否登录
router.post('/checkLogin',function(req,res,next){
    // 判断用户是否登录
    if(req.cookies._id){
        res.json({
            status:"0",
            msg:"",
            result:req.cookies.userName || ''
        })
    }else{
        res.json({
            status:"1",
            msg:"当前未登录",
            result:""
        })
    }
})

// 查询当前用户的购物车数据
router.get("/cartList",function(req,res,next){
    var _id = req.cookies._id;   // req 要写cookies
    User.findOne({_id:_id},function(err,doc){
        if(err){
            res.json({
                status:"1",
                msg:err.message,
                result:""
            })
        }else{
            if(doc){
                res.json({
                    status:"0",
                    msg:'',
                    result:doc.cartList
                })
            }
        }
    })
})

// 购物车删除
router.post("/cartDel",function(req,res,next){
    var _id = req.cookies._id,productId = req.body.productId;
    User.update({
        _id:_id
    },{
        $pull:{
            'cartList':{
                'productId':productId
            }
        }
    },function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:""
            })
        }else{
            res.json({
                status:'0',
                msg:"",
                result:"suc"
            })
        }
    })
})


// 修改商品数量
router.post("/cartEdit",function(req,res,next){
    var _id = req.cookies._id,
        productId = req.body.productId,
        productNum = req.body.productNum,
        checked = req.body.checked;
    User.update({"_id":_id,"cartList.productId":productId},{
        "cartList.$.productNum":productNum,
        "cartList.$.checked":checked
    },function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:""
            })
        }else{
            res.json({
                status:'0',
                msg:"",
                result:"suc"
            })
        }
    })
});

// 全选修改
router.post("/editCheckAll",function(req,res,next){
    var _id = req.cookies._id,
        checkAll = req.body.checkAll ? "1" : "0";
    User.findOne({"_id":_id},function(err,user){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:""
            })
        }else{
            if(user){
                user.cartList.forEach((item)=>{
                    item.checked = checkAll;
                })
                user.save(function(error,doc){
                    if(error){
                        res.json({
                            status:'1',
                            msg:error.message,
                            result:""
                        })
                    }else{
                        res.json({
                            status:'0',
                            msg:"",
                            result:"suc"
                        })
                    }
                })
            }
        }
    })
})

// 查询用户收获地址接口
router.get('/addressList',function(req,res,next){
    var _id = req.cookies._id;
    User.findOne({"_id":_id},function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:""
            })
        }else{
            res.json({
                status:'0',
                msg:"",
                result:doc.addressList
            })
        }
    })
})



//设置默认收获地址接口
router.post('/setDefault',function(req,res,next){
    var _id = req.cookies._id,addressId = req.body.addressId;
    User.findOne({_id:_id},function(err,doc){
        if (err){
          res.json({
              status:'1',
              msg:err.message,
              result:''
          })
        }else{
            if (doc){
                var addressList = doc.addressList;
                addressList.forEach((item)=>{
                    if(item.addressId == addressId){
                        item.isDefault = true;
                    }else{
                        item.isDefault = false;
                    }
                })
                doc.save(function (error,docm) {
                    if(error){
                        res.json({
                            status:'1',
                            msg:error.message,
                            result:""
                        })
                    }else{
                        res.json({
                            status:'0',
                            msg:"",
                            result:"suc"
                        })
                    }
                })
            }

        }
    })
})


//删除地址接口
router.post('/delAddress',function(req,res,next){
    var _id = req.cookies._id,addressId = req.body.addressId;
    User.update({
        _id:_id
    },{
        $pull:{
            'addressList':{
                'addressId':addressId
            }
        }
    },function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:""
            })
        }else{
            res.json({
                status:'0',
                msg:"",
                result:"suc"
            })
        }
    })

})


//创建订单
router.post("/payMent",function(req,res,next){
    var _id = req.cookies._id,
        orderTotal = req.body.orderTotal,
        addressId = req.body.addressId;
    User.findOne({_id:_id},function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            })
        }else{
            var address = '',goodsList = [];
            // 获取当前用户信息
            doc.addressList.forEach((item)=>{
                if(addressId == item.addressId){
                    address = item;
                }
            })
            // 获取用户购物车购买的商品
            doc.cartList.filter((item)=>{
                if(item.checked == '1'){
                    goodsList.push(item);
                }
            })

            var platform = 36630;

            var r1 = Math.floor(Math.random()*10);
            var r2 = Math.floor(Math.random()*10);
            var sysDate = new Date().Format('yyyyMMddhhmmss');
            var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
            var orderId =platform+r1+sysDate+r2;


            // 创建订单
            var order = {
                orderId:orderId,
                orderTotal:orderTotal,
                addressInfo:address,
                goodsList:goodsList,
                orderStatus:'1',
                cresateDate:createDate
            }

            doc.orderList.push(order);

            doc.save(function(err,doc){
                if(err){
                    res.json({
                        status:'1',
                        msg:err.message,
                        result:''
                    })
                }else{
                    // 删除购物车中已购买的的商品
                    goodsList.filter((item)=>{
                        User.update({
                            _id:_id
                        },{
                            $pull:{
                                'cartList':{
                                    'productId':item.productId
                                }
                            }
                        },function(err,doc){
                            if(err){
                                res.json({
                                    status:'1',
                                    msg:err.message,
                                    result:""
                                })
                            }else{

                            }
                        })
                    })

                    res.json({
                        status:'0',
                        msg:'',
                        result:{
                            orderId:order.orderId,
                            orderTotal:order.orderTotal
                        }
                    })
                }
            })
        }
    })
})


// 根据订单ID查询订单信息
router.get('/orderDetail',function(req,res,next){
    var _id = req.cookies._id,orderId=req.param("orderId");
    User.findOne({_id:_id},function(err,userInfo){
        if(err){
            res.json({
                status:"1",
                msg:err.message,
                result:''
            })
        }else{
            var orderList = userInfo.orderList
            if(orderList.length > 0){
                var orderTotal = 0;
                orderList.forEach((item)=>{
                    if(item.orderId == orderId){
                        orderTotal = item.orderTotal;
                    }
                })
                if(orderTotal>0){
                    res.json({
                        status:'0',
                        msg:'',
                        result:{
                            orderId:orderId,
                            orderTotal:orderTotal
                        }
                    })
                }else{
                    res.json({
                        status:'120002',
                        msg:'无此订单',
                        result:''
                    })
                }
            }else{
                res.json({
                    status:'120001',
                    msg:'当前用户未创建订单',
                    result:''
                })
            }
        }
    })
})


// 获取购物车商品数量
router.get('/getCartCount',function(req,res,next){
    if(req.cookies && req.cookies._id){
        var _id = req.cookies._id;
        User.findOne({_id:_id},function(err,doc){
            if(err){
                res.json({
                    status:'1',
                    msg:err.message,
                    result:''
                })
            }else{
                var cartList = doc.cartList;
                var cartCount = 0;
                cartList.forEach((item)=>{
                    cartCount += parseInt(item.productNum);
                })
                res.json({
                    status:'0',
                    msg:'',
                    result:cartCount
                })
            }
        })
    }
})


// 新增收货地址
router.post('/addNewAddress',function(req,res,next){
    var _id = req.cookies._id,postCode=req.body.postCode;
    var reaper = req.body.reaper,reaperAddress = req.body.reaperAddress,reaperTel=req.body.reaperTel;
    var param = {
        addressId:uuid(),
        userName:reaper,
        streetName:reaperAddress,
        postCode:postCode,
        tel:reaperTel,
        isDefault:false
    };

    User.findOne({_id:_id},function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            })
        }else{
            if(doc.addressList.length==0){
                param.isDefault = true;
            }
            doc.addressList.push(param);
            doc.save();
            res.json({
                status:'0',
                msg:'suc',
                result:''
            })

        }
    })
})

module.exports = router;
