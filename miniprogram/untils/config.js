const tableName = {
  user:"b_user",
  cate:"b_cate",
  menu:"b_menu"
}
//加入管理员id，只有管理员才能修改菜谱分类，目前先假设自己就是管理员，只有自己的openid才能进行菜品分类的曾删改
const admin_id = "ozpp-5e8ZcaKxnwtf3EhBHt_4VVA"
export {
  tableName,
  admin_id
}