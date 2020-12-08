// pages/category/category.js
import Db from "../../untils/db"
import {tableName} from "../../untils/config"
const {cate} = tableName
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUpdateBtn:false,//是否显示修改
    addCateName:"", //用户输入的菜单名称，默认刚上来是空字符串
    cates:[], //放所有的分类
    updateCateName:"", //用户要修改的分类名称
    index:0 //要修改的数据的索引
  },
  _inputAddCateName:function(e){
    this.setData({
      addCateName:e.detail.value
    })
  },
  //添加分类
  _addCate:async function(){
    //1、首先判断用户输入的分类名称是否为空
    if(this.data.addCateName ==""){
      wx.showToast({
        icon:"none",
        title:"分类名不能为空"
      })
      return;
    }else if(this.data.addCateName.length >= 6){
      let newName = this.data.addCateName.substring(0,6);
      this.setData({
        addCateName:newName
      })
    }
    //2、判断有没有添加过该分类
    let res = await Db.findByWhere(cate,{cateName:this.data.addCateName})
    // console.log(res);
    if(res.data.length === 0){
      //没查到的话就添加分类
      let res = await Db.add(cate,{
        cateName:this.data.addCateName
      });
      //如果添加成功
      if(res._id){
        this.setData({
          addCateName:""
        })
        wx.showToast({
          title:"添加成功",
          icon:"success"
        })
        this._getCate();
      }
      
    }else{
      wx.showToast({
        title:"该分类已存在",
        icon:"none"
      });
      this.setData({
        addCateName:""
      })
      return;
    }
    //3、新建一张表，存储菜单分类
  },
  _deleteCate:function(e){
    // let _this = this;
    wx.showModal({
      title:"系统提示",
      content:"此操作将永久删除该菜单",
      success:async res=>{
        if(res.confirm){
          //获取点删除时传的值
          let index = e.currentTarget.dataset.index;
          let res = await Db.removeById(cate,this.data.cates[index]._id)
          if(res.stats.removed){
            wx.showToast({
              title:"删除成功",
              icon:"success",
              duration:1000
            })
            //两种方式都可以重新渲染页面
            // this._getCate()
            this.data.cates.splice(index,1)
            this.setData({
              cates:this.data.cates
            })
          }
          
        }
      }
    })
  },
  //显示修改框
  _showUpdateInput:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      //使修改的框显示，并将现在的值显示在修改的input中
      showUpdateBtn:true,
      updateCateName:this.data.cates[index].cateName,
      index:index
    })
    
  },
  //修改的input中的值发生改变时
  _updateCateNameInput:function(e){
      this.setData({
        updateCateName:e.detail.value
      })
  },
  //点击修改时改变分类的内容
  _updateCate:async function(){
    //判断是否为空
    if(this.data.updateCateName == ""){
      wx.showToast({
        title:"请输入修改内容",
        icon:"none",
        duration:1000
      })
      this.setData({
        showUpdateBtn:false,
        updateCateName:""
      })
      return;
    }
    //判断是否存在,可以通过数据库查找，也可以通过查找data.cates去比较
    let index = this.data.cates.findIndex(item=>{
      return item.cateName == this.data.updateCateName
    })
    //console.log(index); //有的话就返回下标，没有就返回-1
    if(index !== -1){
        wx.showToast({
          title:'分类名不能重复',
          icon:"none",
          duration:1500
        })
        this.setData({
          showUpdateBtn:false,
          updateCateName:""
        })
        return;
    }
    
     index = this.data.index
    //修改数据库的内容
    let res =await Db.updateById(cate,this.data.cates[index]._id,{
      cateName:this.data.updateCateName
    })
    if(res.stats.updated){
      this._getCate();
      wx.showToast({
        title:"修改成功",
        icon:"success",
        duration:1500
      })
      
      this.setData({
        showUpdateBtn:false,
        updateCateName:""
      })
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:function (options) {
    //获取所有的分类，然后去渲染菜单列表
    this._getCate()
  },
  _getCate:async function(){
    wx.showLoading({
      title:"加载中"
    })
    let res = await Db.findAll(cate)
    // console.log(res);
    if(res.data.length != 0){
      this.setData({
        cates:res.data
      })
    }
    wx.hideLoading()
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