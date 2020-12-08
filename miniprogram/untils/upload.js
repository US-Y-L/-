//将用户加入的图片进行转换
const uploader = async (fileList,dir="default")=>{
  let tasks = []
  fileList.forEach(item=>{
    let ext = item.url.split(".").pop();
    let filename=(new Date).getTime()+Math.random()+"."+ext
    let promise = wx.cloud.uploadFile({
      cloudPath:dir+"/"+filename,
      filePath:item.url
    })
    tasks.push(promise)
  })
  return (await Promise.all(tasks)).map(item=>{
    return item.fileID
  })
}

export {
  uploader
}