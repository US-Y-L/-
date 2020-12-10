import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
import db from "../../untils/db"
let {user,cate,menu} = tableName
// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists:[],
    id:"", //分类id
    flag:0, //0代表是从分类列表过来的
    keyword:"",
    isZero:false
  },
  onLoad:function(option){
    this._setOptions(option)
    //获取菜谱
    this._getMenu()
  },
  //获取该分类下的菜谱
  _getMenu:async function(){

    wx.showLoading({
      title:"加载中"
    })
    let where = null
    //根据条件不同 改变where中的条件 去显示不同的内容
    if(this.data.flag==0){
      where={cate_id:this.data.id,menu_status:0}
    }
    if(this.data.flag==1){
      where={
        menu_name:Db.db.RegExp({ //正则表达式
          regexp:this.data.keyword,
          option:"i"
        }),
        menu_status:0
      }
    }
    console.log(where);

    let res = await Db.findAll(menu,where)
    //let res = await Db.findAll(menu,{cate_id:this.data.id,menu_status:0})
    console.log(res.data)
    if(res.data.length != 0){
      //获取用户头像和昵称
      let tasks = [];
      res.data.forEach(async item=>{
        let promise = Db.findAll(user,{_openid:item._openid})
        tasks.push(promise)
      })
      let userArr = await Promise.all(tasks)
      res.data.forEach((item,index)=>{
        item.imgUrl = userArr[index].data[0].avatarUrl;
        item.nickName = userArr[index].data[0].nickName;
      })
      console.log(res.data);
      this.setData({
        lists:res.data
      })

    }else{
      wx.showToast({
        title:"暂无相关菜谱",
        icon:"none"
      })
      //控制添加菜谱的显示
      this.setData({
        isZero:true
      })
    }
    wx.hideLoading()
  },
  //点击菜谱中的每一项，跳转到详情页
  _goDetail(e){
    let index = e.currentTarget.dataset.index
    let {_id,menu_name} = this.data.lists[index]
    wx.navigateTo({
      url:`../detail/detail?id=${_id}&menuName=${menu_name}`
    })
  },
  //设置导航
  _setOptions:function(option){
    //此时存在两种情况，从主页进来的以及从搜索页进来的
    this.setData({
      id:option.id||"",
      flag:option.flag||0,
      keyword:option.keyword||""
    })
    //设置导航
    wx.setNavigationBarTitle({
      title:option.cateName||"搜索结果"
    })
  }
})