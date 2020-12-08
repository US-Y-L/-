import Db from "../../untils/db"
import {tableName,admin_id} from "../../untils/config"
let {user,cate,menu} = tableName
Page({
    data: {
        types: [],
        recipes:[],
        currentPage:1,
        isMore:true
    },
    onLoad(){
        //获取前三个菜谱分类
        this._getCates()
        //获取热门菜谱
        this._getHotMenu(1)
    },
    //获取热门的菜谱
    _getHotMenu:async function(p){
        wx.showLoading({
            title:"加载中"
        })
        let res = await Db.findByPage(menu,{menu_status:0},p,4,{field:"menu_view",sort:"desc"})
        
        if(res.data.length!=0){
            //获取用户头像和昵称
            let tasks = []
            res.data.forEach(async item=>{
                let promise = Db.findByWhere(user,{_openid:item._openid})
                tasks.push(promise)
            })
            let userArr = await Promise.all(tasks)
            res.data.forEach((item,index)=>{
                item.nickName=userArr[index].data[0]["nickName"];
                item.imgUrl = userArr[index].data[0]["avatarUrl"];
            })
            // console.log(res.data)
            // console.log(userArr);
            if(p == 1){
                this.setData({
                    recipes:res.data
                })
            }else{
                this.setData({
                    recipes:this.data.recipes.concat(res.data)
                })
            }
        }else{
            this.setData({
                isMore:false
            })
        }
        wx.hideLoading()
    },
    //获取三个菜谱分类
    _getCates:async function(){
        let res = await Db.findByPage(cate,{},1,3)
        if(res.data.length!=0){
            this.setData({
                types:res.data
            })
        }
    },
    //点击全部分类进入所有菜谱页
    _goCateList:function(){
        wx.navigateTo({
            url:"../type/type"
        })
    },
    //点击每个菜谱进入对应的列表页
    _goMenuList:function(e){
        let index = e.currentTarget.dataset.index
        let {_id,cateName} = this.data.types[index]
        wx.navigateTo({
            url:`../list/list?id=${_id}&cateName=${cateName}`
        })
    },
    //上划加载更多
    onReachBottom:function(){
        if(this.data.isMore){
            this.data.currentPage++;
            this._getHotMenu(this.data.currentPage)
        }else{
            wx.showToast({
                title:"已经到底了亲",
                icon:"none"
            })
        }
    },
    //下拉刷新,首先在index.json中配置允许下拉刷新
    onPullDownRefresh(){
        //此时一个小bug，数据又加了一遍
        //在_getHotMenu(p)赋值时判断p是不是1，如果是就直接赋值，不是就加
        this._getHotMenu(1)
        this.setData({
            currentPage:1,
            isMore:true
        })
    },
    //点击热门菜谱进入详情
    _goDetail:function(e){
        let index = e.currentTarget.dataset.index
        
        let {_id,menu_name} = this.data.recipes[index]
        wx.navigateTo({
            url:`../detail/detail?id=${_id}&menuName=${menu_name}`
        })
    }

})