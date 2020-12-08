// pages/my/my.js
//连接数据库
import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
const {user,menu} = tableName
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false, //是否登录。 false 未登录  true，已经登录,
    userInfo:{},
    switchIndex:0,
    recipes:[],
    currentPage:1,//记录当前菜单的页数
    isMore:true, //标识下拉时有没有更多的数据，当数据显示完了hi后改为false
  types:[
    {typename:"营养菜谱",'src':"../../static/type/type01.jpg"},
    {typename:"儿童菜谱",'src':"../../static/type/type02.jpg"},
    {typename:"家常菜谱",'src':"../../static/type/type03.jpg"},
    {typename:"主食菜谱",'src':"../../static/type/type04.jpg"},
    {typename:"西餐菜谱",'src':"../../static/type/type05.jpg"},
    {typename:"早餐菜谱",'src':"../../static/type/type06.jpg"},
  ],
  lists:[
    {
      src:"../../static/list/list01.jpg",
      name:"土豆小番茄披萨",
      userInfo:{
        nickName:"林总小图",
        pic:"../../static/list/users.png"
      },
      views:999,
      follow:100
    },
    {
      src:"../../static/list/list02.jpg",
      name:"草莓巧克力三明治",
      userInfo:{
        nickName:"林总小图",
        pic:"../../static/list/users.png"
      },
      views:88,
      follow:200
    },
    {
      src:"../../static/list/list03.jpg",
      name:"法师意大利面",
      userInfo:{
        nickName:"林总小图",
        pic:"../../static/list/users.png"
      },
      views:999,
      follow:100
    },
    {
      src:"../../static/list/list04.jpg",
      name:"自制拉花",
      userInfo:{
        nickName:"林总小图",
        pic:"../../static/list/users.png"
      },
      views:999,
      follow:100
    },
    {
      src:"../../static/list/list05.jpg",
      name:"营养早餐",
      userInfo:{
        nickName:"林总小图",
        pic:"../../static/list/users.png"
      },
      views:999,
      follow:100
    }
  ]
  },

  onLoad:function(){
    //每次用户退出都需要重新登录，在这里判断用户是否授权，如果授权了就去获取用户信息
    //用户假如授权了，在他自己的缓存里是有值的
    this._login();
  },
  //登录
  _login:function(){
    wx.showLoading({
      title:"载入中"
    })
    let isLogin = wx.getStorageSync("isLogin") || false;
    let _openid = wx.getStorageSync("_openid") || "";
    // let userInfo = wx.getStorageSync("userInfo") || "";
    if(isLogin &&  _openid !=""){  //说明用户已经登录或者授权
      this.setData({
        isLogin:true,
        userInfo:wx.getStorageSync("userInfo")
      })
      //重新进来之后，假如用户本地有缓存信息，同样显示该用户 发布的菜谱
      this._getMyMenu(1)
    }else{
      //假如缓存被清掉，判断用户有没有授权
      //目前有问题，得不到res.authSetting["scope.userInfo"]
      wx.getSetting({
        success:res=>{
          console.log(res);
          //如果用户授权了userInfo
          if(res.authSetting["scope.userInfo"]){
            wx.getUserInfo({
              success:async res=>{
                let userInfo = res.userInfo;
                //获取用户openid的值
                res = await wx.cloud.callFunction({
                  name:"b-login"
                })
                let _openid = res.result.openid
                wx.setStorageSync("_openid",_openid);
                wx.setStorageSync("userInfo",userInfo);
                wx.setStorageSync("isLogin",true);
                this.setData({
                  isLogin:true,
                  userInfo
                })
                //同样去获取用户发布的菜谱
                this._getMyMenu(1)
              }
            })
          }
        }
      })
    }
    wx.hideLoading()
  },
  //发布菜谱
  _goPublish:function(){
    //只有管理员才有权发布菜谱
    let _openid = wx.getStorageSync("_openid") || "";
    if(_openid == admin_id){
      wx.navigateTo({
        url:'../pbrecipe/pbrecipe'
      })
    }
    
  },
  //点击用户头像进入添加菜谱分类管理页
  _goCate:function(){
    wx.navigateTo({
      url:'../category/category'
    })
  },
  //获取用户的菜谱
  _getMyMenu:function(p){

  },
  //切换选项卡,上面的样式变化
  _switchTab:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      switchIndex:index
    })
  },
  //获取用户信息
  _getUserInfo:async function(e){
    if(e.detail.userInfo){ //用户点确定
      wx.showLoading({
        title:"登陆中"
      })
      //获取用户的详细信息
      let userInfo = e.detail.userInfo;
      console.log(userInfo);
      //获取用户唯一的标识openid 两种获取方法
      //1、使用小程序的登录流程，需要去请求服务器
      //2、使用小程序的云函数，会返回openid
      let res = await wx.cloud.callFunction({
        name:"b-login"
      })
      // console.log(res);
      let openid = res.result.openid;
      //再存之前先查询有没有这个用户，根据_openid去匹配数据库中的用户的信息
      res = await Db.findByWhere(user,{_openid:openid})
      console.log(res);
      // console.log(res);
      if(res.data.length === 0){
        //将用户的信息存入到数据库,在没有查到的情况下才存入数据库
        res = await Db.add(user,userInfo)
      }
      //将用户的信息放入缓存，_openid以及用户有没有登录等信息,不管查到还是没查到，都应该将用户信息放入到缓存中去
      wx.setStorageSync("_openid",openid);
      wx.setStorageSync("userInfo",userInfo);
      wx.setStorageSync("isLogin",true);

      //下一步，对初始化的数据进行重新赋值
      this.setData({
        isLogin:true,
        userInfo:userInfo
      })
      //登录成功后，获取该用户发布过的菜单
      this._getMyMenu(1)

      //一旦登录成功，隐藏掉Loading的图标
      wx.hideLoading();
      
    }else{
      wx.showToast({
        title:"未授权",
        icon:"none",
        duration:1500
      })
    }
  },
  //获取用户发布的菜单的函数,每次不都取出来，用户下滑之后才都取出来
  _getMyMenu:async function(p){ //p代表页码
    wx.showLoading({
      title:"加载中"
    })
    let _openid = wx.getStorageSync("_openid");
    //取得时候两个条件 自己发布的 且menu_status的状态是未删除的
    let res = await Db.findByPage(menu,{_openid,menu_status:0},p,4,{field:"menu_time",sort:"desc"})
    if(res.data.length != 0){
      
      this.setData({
          recipes:this.data.recipes.concat(res.data)
      })
      wx.hideLoading()
    }else{
      this.setData({
        isMore:false
      })

      wx.showToast({
        title:"没有更多了,亲",
        icon:"none",
        duration:1000
      })
    }

  },
  //下拉到底部时执行该方法
  onReachBottom:function(){
    if(this.data.switchIndex === 0){
      if(this.data.isMore){
        this.data.currentPage++;
        console.log(this.data.currentPage);
        this._getMyMenu(this.data.currentPage)
      }else{
        wx.showToast({
          title:"我们是有底线的，亲",
          icon:"none",
          duration:1000
        })
      }
    }
    
      
    
    
  },
  _delStyle(){
    wx.showModal({
      title:"删除提示",
      content:"确定要删除么？",
      
    })
  },
  //我发布过的分类,用户切换选项卡到分类的时候
  _getMyCate:function(){

  }

})