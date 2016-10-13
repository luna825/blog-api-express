
import mongoose from 'mongoose'

const User = mongoose.model('User')
const Logs = mongoose.model('Logs')

const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;


export function getMe(req, res){
  const userId = req.user._id
  User.findById(userId).exec()
    .then(user => res.status(200).json(user.userInfo))
    .catch(err => res.status(401).send())

}


//后台获取用户数据
export function getUserList(req, res, next){
  const currentPage = parseInt(req.query.currentPage) > 0 ? parseInt(req.query.currentPage) : 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage) > 0 ? parseInt(req.query.itemsPerPage) : 10;
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

// 删除用户
export function destroy(req, res, next){

  const userId = req.user._id
  if( String(userId) === String(req.params.id) ){
    return res.status(403).send({message: '不能删除自己已登录帐号'})
  }else{
    (async function(){
      const user = await User.findByIdAndRemove(req.params.id)
      await Logs.create({
        uid: userId,
        content: "删除用户" + user.email,
        type:'user'
      })
      return res.status(200).send({success:true})
    })().catch(err => next(err))
  }

}

//更新用户
export function updateUser(req, res){

  const editUserId = req.params.id;
  const nickname = req.body.nickname?req.body.nickname.replace(/(^\s+)|(\s+$)/g, ""):'';

  let err_msg;
  if (nickname === ''){
    err_msg = '呢称不能为空';
  }else if(nickname.length <= 2 || nickname.length >30|| !NICKNAME_REGEXP.test(nickname)){
    err_msg = "呢称不合法";
  }

  if(err_msg){
    return res.status(422).send({err_msg});
  }

  (async function(){
    const user = await User.findById(editUserId);
    user.nickname = nickname;
    req.body.status && (user.status = req.body.status);
    req.body.newPassword && (user.password = req.body.newPassword);

    await user.save();
    await Logs.create({
      uid: req.user._id,
      content:'修改用户' + user.email,
      type:'user'
    });

    return res.status(200).json({success:true, user_id:user._id});

  })().catch(err => console.log(err))


}