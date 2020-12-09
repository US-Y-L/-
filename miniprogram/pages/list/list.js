import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
let {user,cate,menu} = tableName
// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists:[],
    id:"", //分类id
  },
  onLoad:function(option){
    this._setOptions(option)
    //获取该分类下的菜谱
    this._getMenu()
  },
  //获取该分类下的菜谱
  _getMenu:async function(){
    let res = await Db.findAll(menu,{cate_id:this.data.id,menu_status:0})
    // res.map(async item=>{
    //   let user1 = await Db.findAll(user,{_openid:item._openid})
    // })
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
    }

  },
  //点击菜谱中的每一项，跳转到详情页
  _goDetail(e){
    let index = e.currentTarget.dataset.index
    let {_id,menu_name} = this.data.lists[index]
    wx.navigateTo({
      url:`../detail/detail?id=${_id}&menuName=${menu_name}`
    })
  },
  _setOptions:function(option){
    this.setData({
      id:option.id
    })
    //设置导航
    wx.setNavigationBarTitle({
      title:option.cateName
    })
  }
})