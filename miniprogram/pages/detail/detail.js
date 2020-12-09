import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
let {user,cate,menu} = tableName
// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      imgs:[
        "../../static/detail/1.jpg",
        "../../static/detail/2.jpg",
        "../../static/detail/4.jpg",
        "../../static/detail/6.jpg",
        "../../static/detail/8.jpg",
      ]
  },
  onLoad:function(option){
    this._getCateInfo(option)
  },
  //查询信息
  _getCateInfo:async function(option){
    let {id,menuName} = option;
    wx.setNavigationBarTitle({
      title:menuName
    })
    let res = await Db.findByWhere(menu,{_id:id,menu_status:0});
    console.log(res);
    if(res.data.length != 0){
      let {_openid} = res.data
      
    }
  }
})