import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
let {user,cate,menu} = tableName
// pages/type/type.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:[]
  },
  onLoad(){
    this._getCates()
  },
  _getCates:async function(){
    wx.showLoading({
      title:"加载中"
    })
    let res = await Db.findAll(cate)
    if(res.data.length != 0){
      console.log(res.data)
      this.setData({
        types:res.data
      })
    }
    wx.hideLoading()
  }
 
})