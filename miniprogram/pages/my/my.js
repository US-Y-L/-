// pages/my/my.js
//连接数据库
import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
const {user,cate,menu,collect} = tableName
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
  types:[],
  lists:[]
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
  //切换选项卡,上面的样式变化
  _switchTab:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      switchIndex:index
    })
    //获取菜单分类
    if(index == 1 && this.data.types.length == 0){
      this._getMyCate()
    }
    //获取该用户的收藏菜谱
    if(index == 2 && this.data.lists.length == 0){
      this._getMyFollow()
    }
  },
  //获取授权用户的关注
  _getMyFollow: async function(){
    let _openid = wx.getStorageSync("_openid");
    let res = await Db.findAll(collect,{_openid}) //得到的是菜谱的id
    wx.showLoading({
      title:"加载中"
    })
    if(res.data.length != 0){ 
      //根据菜谱的id去取菜谱的信息
      let menuArr =res.data.map(item=>{
        return item.menu_id
      })
      res = await Db.findAll(menu,{_id:Db._.in(menuArr)})
      // console.log(res)

      if(res.data.length != 0){
        let tasks = []
        res.data.forEach(item=>{
          let promise = Db.findByWhere(user,{_openid:item._openid})
          tasks.push(promise)
        })
        let res1 = await Promise.all(tasks)
        res.data.forEach((item,index)=>{
          item.userInfo = res1[index].data[0]
        })
        this.setData({
          lists:res.data
        })
        console.log(this.data.lists)
      }
    }
    wx.hideLoading()
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
  //查找我发布过的分类,一般切换选项卡到分类页的时候再去获取
  _getMyCate:async function(){
    wx.showLoading({
      title:"加载中"
    })
    let _openid = wx.getStorageSync("_openid")
      let res = await Db.findAll(menu,{_openid,menu_status:0})
      // console.log(res);
      if(res.data.length != 0){
        let cate_id = res.data.map(item=>{
          return item.cate_id
        })
        res=await Db.findAll(cate,{
          _id:Db._.in(cate_id)
        })
        if(res.data.length!=0){
          this.setData({
            types:res.data
          })
        }
      }
      wx.hideLoading()
  },
  //点击菜谱图片进入到菜谱详情
  _goDetail:function(e){
    console.log(e);
    let index = e.currentTarget.dataset.index
    let {_id,menu_name} = this.data.recipes[index]
    console.log(index)
    wx.navigateTo({
      url:`../detail/detail?id=${_id}&menuName=${menu_name}`
    })
  },
  //点击列表页进入列表详情
  _goList:function(e){
      let index = e.currentTarget.dataset.index
      let {_id,cateName}=this.data.types[index]
      wx.navigateTo({
        url:`../list/list?id=${_id}&cateName=${cateName}`
      })
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
  //长按删除功能
  _delMenu(e){
    wx.showModal({
      title:"删除提示",
      content:"您确定要删除么？",
      success: async res=>{
        if(res.confirm){
          //执行删除操作，不是真的删，将菜谱里的menu_status改变状态
          let index = e.currentTarget.dataset.index
          let res = await Db.updateById(menu,this.data.recipes[index]._id,{menu_status:1})
          if(res.stats.updated){ //表示删除成功
            this.data.recipes.splice(index,1)
            this.setData({
              recipes:this.data.recipes
            })
            wx.showToast({
              title:"删除成功",
              icon:"success",
              duration:1000
            })
          }
        }
      }
    })
  }
  

})