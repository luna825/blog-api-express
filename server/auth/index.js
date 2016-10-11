import {Router} from 'express'
import {signToken} from './auth.service.js'
import mongoose from 'mongoose'
const User = mongoose.model("User")
const router = Router()

router.post('/',(req, res, next) =>{
  const {email, password} = req.body;
  if(email ==='' || password =='' ){
    console.log(email)
    res.status(400).send({msg: "empty"})
  }

  (async function(){
    const user = await User.findOne({email: email.toLowerCase()}).exec()
    if (!user){
      return res.json({msg:"no user"})
    }
    if(!user.authenticate(password)){
      return res.json({msg:"waring password"})
    }
    if(user.status === 2){
      return res.json({msg: "用户被阻止登录"})
    }
    if(user.status === 0 ){
      return res.json({msg:"用户未验证"})
    }

    const token = signToken(user._id)
    return res.json({token: token});
  })().catch(err => console.log(err))

})

export default router