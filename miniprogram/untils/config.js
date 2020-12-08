const tableName = {
  user:"b_user",
  cate:"b_cate",
  menu:"b_menu"
}
//加入管理员id，只有管理员才能修改菜谱分类，假设自己是管理员，只有自己的openid才能进行菜单页面的增删改
const admin_id = "ozpp-5e8ZcaKxnwtf3EhBHt_4VVA"
export {
  tableName,
  admin_id
}