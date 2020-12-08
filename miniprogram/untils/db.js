//首先链接数据库
const db = wx.cloud.database();
//获取数据  参数where表示通过什么条件去查找，where是一个空对象是表示没有条件
const findByWhere = (table,where={})=>{
  return db.collection(table).where(where).get()
}
//添加
const add = (table,data)=>{
  return db.collection(table).add({
    data
  })
}
//获取所有的数据
//where默认值是一个空对象，表示没有任何条件，都查
//小程序有限制，一次最多只能取20条，通过该方法可以将数据都拿出来
const findAll = async(table,where={})=>{
  const MAX_LIMIT = 20;
  //先取查询的总条数
  const countResult = await db.collection(table).where(where).count();
  const total = countResult.total;
  //先判断查询到的total的长度
  if(total === 0){
      return {
        data:[]
      }
  }else{
    //判断分几次取查
    const batchTimes = Math.ceil(total/MAX_LIMIT);
    let tasks =[]
    for(var i = 0; i< batchTimes;i++){
      //每次取都会得到一个promise对象
      let promise = db.collection(table)
      .skip(i*MAX_LIMIT)
      .limit(MAX_LIMIT)
      .where(where)
      .get()
      tasks.push(promise);
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
  }
  
}

//删除数据
const removeById = (table,id) =>{
  return db.collection(table).doc(id).remove()
}

//修改数据
const updateById = (table,id,data)=>{
  return db.collection(table).doc(id).update({
    data
  })
}

//通过分页的方式获取数据
const findByPage=(table,where={},p=1,limit=6,order=
  {field:"menu_time",sort:"asc"})=>{
    let start = (p-1)*limit
  return db.collection(table).where(where)
  .skip(start) //从第几页开始查
  .limit(limit) //一页显示多少条
  .orderBy(order.field,order.sort) //根据什么条件进行排序
  .get()
}


export default {
  add,
  findByWhere,
  findAll,
  removeById,
  updateById,
  findByPage
}