// pages/pbrecipe/pbrecipe.js
import Db from "../../untils/db"
import {tableName} from "../../untils/config"
import {uploader} from"../../untils/upload"
let {cate,menu} = tableName

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cates:[], //获取所有的分类
    fileList:[], //上传图片的列表
   
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getCates();
  },
  //获取所有分类的函数
  _getCates:async function(){
    wx.showLoading({
      title:"加载中"
    })
    let res = await Db.findAll(cate)
    
    if(res.data.length != 0){
      this.setData({
        cates:res.data
      })
    }
    wx.hideLoading()
  },
  //选择图片
  _selectImg:function(e){
    //里面包含上传的图片的路径
    console.log(e);
    let fileList = e.detail.tempFilePaths.map(item=>{
       return {url:item}
    })
    this.setData({
      fileList
    })
  },
  //删除图片时修改data中的fileList
  _deleteImg:function(e){
    //点击时删除的下标可以获取到，通过e.detail.index
    this.data.fileList.splice(e.detail.index,1);
    this.setData({
      fileList:this.data.fileList
    })
  },
  //发布菜谱
  _publishMenu:async function(e){
    wx.showLoading({
      title:"载入中"
    })
    //1、判断数据的合法性
    // console.log(e);
    let {menu_name,cate_id,menu_info} = e.detail.value
    if(menu_name=="" ||menu_info==""||this.data.fileList.length == 0){
      wx.showToast({
        title:"请完善菜谱信息",
        icon:"none",
        duration:1000
      })
    }
    //2、处理图片
    let menu_img = await uploader(this.data.fileList,"menu");
    //上传的图片与返回的图片数量相等
    if(this.data.fileList.length == menu_img.length){
      //说明上传成功，将数据传入到数据库
      let res = await Db.add(menu,{
        menu_name,
        cate_id,
        menu_img,
        menu_info,
        menu_view:0,
        menu_collect:0,
        menu_status:0, //进行逻辑删除时使用，一般不会真正删除用户的数据，而是通过改变状态，通过不同的状态去进行显示与否
        menu_time:(new Date).getTime() //加入时间戳，便于排序，因为小程序中提供的_id无法进行排序
      })
      if(res._id){
        wx.showToast({
          title:"发布成功",
          icon:"success"
        })
        //成功后页面跳转回去
        setTimeout(function(){
          wx.navigateBack();
        },2000)
      }
    }else{
      wx.showToast({
        title:"发布失败",
        icon:"none",
        duration:1000
      })
    }
    //3、将数据插入到数据库
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})