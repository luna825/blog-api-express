
import mongoose from 'mongoose'

const User = mongoose.model('User')
const Logs = mongoose.model('Logs')

const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;


export function getMe(req, res){
  const userId = req.user._id
  User.findById(userId).exec()
    .then(user => res.status(200).json(user.userInfo))
    .catch(err => res.status(401).send())

}


//后台获取用户数据
export function getUserList(req, res, next){
  const currentPage = parseInt(req.query.currentPage > 0) ? parseInt(req.query.currentPage) : 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage > 0) ? parseInt(req.query.itemsPerPage) : 10;
  const startRow = (currentPage - 1) * itemsPerPage;

  let sortName = String(req.query.sortName) || 'create'
  if (req.query.sortOrder === false){
    sortName = '-' + sortName;
  }
  (async function(){
      const count = await User.count();
      if (!count){ res.json({msg: "no user"})}
      const userList = await User.find().skip(startRow).limit(itemsPerPage).sort(sortName).exec()
      res.json({data: userList, count})
    })().catch(err => next(err))
}

//添加用户
export function addUser(req, res){
  const email = req.body.email?req.body.email.replace(/(^\s+)|(\s+$)/g, ""):'';
  const password = req.body.password?req.body.password : '';

  let err_msg;

  if(password === ""){
    err_msg = "密码不能为空";
  }else if(email === ""){
    err_msg = "邮箱地址不能为空";
  }else if(email.length <= 4 || email.length > 30 || !EMAIL_REGEXP.test(email) ){
    err_msg = "邮箱地址不合法"
  }

  if(err_msg){
    return res.status(422).send({err_msg:err_msg});
  }

  const newUser = new User(req.body);
  newUser.role = 'user';

  (async function(){

    const user = await newUser.save()
    await Logs.create({
      uid: req.user._id,
      content: '创建新用户' + user.email,
      type:'user'
    })
    return res.json({success:true, user_id: user._id})

  })().catch(err => {
    if( err.errors && err.errors.email){
      return res.status(500).send(err.errors.email.message);
    }
  })

}