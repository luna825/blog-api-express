import User from '../../model/user.model'


//后台获取用户数据
export function getUserList(req, res, next){
  const currentPage = parseInt(req.query.currentPage > 0) ? parseInt(req.query.currentPage) : 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage > 0) ? parseInt(req.query.itemsPerPage) : 10;
  const startRow = (currentPage - 1) * itemsPerPage;

  let sortName = String(req.query.sortName) || 'create'
  if (req.query.sortOrder === false){
    sortName = '-' + sortName
  }
  (async function(){
      const count = await User.count();
      if (!count){ res.json({msg: "no user"})}
      const userList = await User.find().skip(startRow).limit(itemsPerPage).sort(sortName).exec()
      res.json({data: userList, count})
    })().catch(err => next(err))
}