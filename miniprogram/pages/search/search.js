import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
let{user,cate,menu} = tableName
// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hots:[],
  },
  onLoad: function(options){
    this._getHotSearch(1);
  },
  //获取热门搜索
  _getHotSearch:async function(p){
    let res = await Db.findByPage(menu,{menu_status:0},p,9,{field:"menu_view",sort:"desc"})
    // console.log(res);
    if(res.data.length!=0){
      this.setData({
        hots:res.data
      })
    }
  },

  //点击热门搜索时进入到详情页
  _goDetail(e){
    let index = e.currentTarget.dataset.index;
    let {_id,menu_name} = this.data.hots[index]
    if(_id && menu_name){
      wx.navigateTo({
        url:`../detail/detail?id=${_id}&menuName=${menu_name}`
      })
    }
  }

})