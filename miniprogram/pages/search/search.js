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
    lastSearch:"",
    keyword:"",
    lasts:[],
  },
  onLoad: function(options){
    this._getHotSearch(1);
    this._getLastSearch();
  },
  //获取用户输入的关键字
  _inputKeyword:function(e){
      this.setData({
        keyword:e.detail.value
      })
  },
  //获取用户缓存中的近期搜索
  _getLastSearch:function(){
    this.setData({
      lasts:wx.getStorageSync("keywords") || []
    })
  },
  //点击图标进行搜索
  _search:function(){
    if(this.keyword == ""){
      wx.showToast({
        title:"关键字不能为空",
        icon:"none"
      })
      return
    }
    //input中有内容时，将搜索的关键字存入到缓存
    let keywords = wx.getStorageSync("keywords") || [];
    let index = keywords.findIndex(item=>{
      return item == this.keyword
    })
    if(index != -1){
      keywords.splice(index,1)
      
    }
    keywords.unshift(this.data.keyword)
    //只取缓存中的前9个,然后重新存入缓存
    wx.setStorageSync("keywords",keywords.splice(0,9))
    //点击之后跳转,展示搜索列表
    wx.navigateTo({
      url:"../list/list?flag=1&keyword="+this.data.keyword
    })

  },
  //点击近期搜索下面的小块，显示相应的内容
  _goList:function(e){
    let index = e.currentTarget.dataset.index
    this.data.keyword = this.data.lasts[index]
    this._search()
  },
  //获取热门搜索
  _getHotSearch:async function(p){
    let res = await Db.findByPage(menu,{menu_status:0},p,9,{field:"menu_view",sort:"desc"})
    console.log(res);
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