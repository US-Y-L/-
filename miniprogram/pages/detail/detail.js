import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
let {user,cate,menu,collect} = tableName
// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      id:"",
      imgs:[],
      userInfo:{},
      isFollow:false //标识该用户是否关注该菜谱
  },
  onLoad:async function(option){
    //进行初始化设置
    await this._setOption(option)
    //获取列表里需要的信息，以进行展示
    await this._getDetail(option)
    //阅读量+1
    await this._addView()
    //获取用户关注状态,新建一个收藏表，放用户的收藏记录
    await this._getFollow()
  },
  //查询信息
  _getDetail:async function(option){
    let{id,menuName} = option
    let res = await Db.findByWhere(menu,{_id:id,menu_status:0});
    this.setData({
      userInfo:res.data[0],
      id
    })
    console.log(this.data.userInfo);
    if(res.data.length != 0){
      let {_openid,cate_id} = this.data.userInfo
      //根据_openid去user表中查询发布者的昵称以及头像
      let user1 =await Db.findByWhere(user,{_openid});
      //根据cate_id去查找菜谱所属分类
      let cate1 = await Db.findByWhere(cate,{_id:cate_id})
      this.data.userInfo.nickName = user1.data[0].nickName;
      this.data.userInfo.imgUrl = user1.data[0].avatarUrl;
      this.data.userInfo.cateName = cate1.data[0].cateName;
      this.setData({
        userInfo:this.data.userInfo,
        imgs:this.data.userInfo.menu_img
      })
    }
  },
  _getFollow:async function(){
    //用户未登录，isFollow:false首先判断用户是否登录
    let  isLogin = wx.getStorageSync("isLogin")||false
    if(isLogin){
      //已登录，判断用户有没有关注该菜谱
      let _openid = wx.getStorageSync("_openid")
      let res = await Db.findByWhere(collect,{_openid,menu_id:this.data.id})
      if(res.data.length != 0){
        this.setData({
          isFollow:true
        })
      }
    }
  },
  //点击切换是否关注
  _setFollow:function(){
    //用户没有登陆时，先让用户登录
    let isLogin = wx.getStorageSync("isLogin") ||false;
    if (isLogin) { //用户已登陆
      wx.showLoading({
        title:"请稍后"
      })
        //先判断该用户是否关注
        if(this.data.isFollow){ //取消关注
          let _openid = wx.getStorageSync("_openid")
          //collect中删除记录
          Db.removeByWhere(collect,{
            menu_id:this.data.id,
            _openid
          }) .then(res=>{//菜谱的关注量-1 
            Db.updateById(menu,this.data.id,{
              menu_collect:Db._.inc(-1)
            }).then(res=>{
              this.setData({//修改isFollow
                isFollow:false
              })
              wx.hideLoading()
            })
          })
          
        }else{ //+关注 
          //collect中添加记录
          Db.add(collect,{
            menu_id:this.data.id
          }) .then(res=>{//菜谱的关注量+1 
            Db.updateById(menu,this.data.id,{
              menu_collect:Db._.inc(1)
            }).then(res=>{
              this.setData({//修改isFollow
                isFollow:true
              })
              wx.hideLoading()
            })
          })
      
      }
      
    } else {
      wx.showToast({
        title:"请先登录",
        icon:"none",
        duration:1000
      })
      //延时定时器，2秒后跳转到my页面
      setTimeout(()=>{
        wx.switchTab({ //跳转到tabBar页面要使用这样的方式
          url:'../my/my'
        })
      },2000)
    }
  },
  //阅读量+1
  _addView:async function(){
    //使menu表中的menu_view自增1
    await Db.updateById(menu,this.data.id,{
      menu_view:Db._.inc(1)
    })
  },
  //刚进来时进行初始化设置
  _setOption(option){
    let {id,menuName} = option;
    this.setData({
      id
    })
    wx.setNavigationBarTitle({
      title:menuName
    })
  },
  //分享给朋友
  //小程序本身具有分享的功能，但是分享的内容是小程序默认的，做一个自定义分享的功能
  //1、用户点击默认的分享，分享的是整个小程序，用户点击分享的内容进入的是小程序的首页
  //2、用户点击按钮分享，分享的是当前的详情页面，用户点击分享的内容进入的是小程序的对应的详情页
  onShareAppMessage:function(e){
    if(e.from=="menu"){ //右上角默认的分享
      return {
        title:"来看看吧",
        imageUrl:"https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3563308633,2180640064&fm=11&gp=0.jpg",
        path:"../index/index" //设置点击图片进入小程序的哪个页面
      }
    }
    if(e.from=="button"){//点击按钮进行的分享
      return{
        title:`如何做《${this.data.userInfo.menu_name}》`,
        imgUrl:this.data.userInfo.menu_img[0],
        path:"/pages/detail/detail?id="+this.data.id+"&menuName="+this.data.userInfo.menu_name
      }
    }
  },
  //分享给朋友圈,默认不开通，可以通过设置开通分享朋友圈功能  2.11.3版本库开始支持
  //只能展示，不能有交互效果
  //分享给朋友圈，首先完成分享给朋友 page.onShareAppMessage
  onShareTimeLine(){
    return{
      title:"来做菜呀",
      imageUrl:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1152190786,4254404981&fm=11&gp=0.jpg",
      //query里写跳转页面时携带的参数，只写?后面的就行
      query:"id="+this.data.id+"&menuName="+this.data.userInfo.menu_name
    }
  }
})