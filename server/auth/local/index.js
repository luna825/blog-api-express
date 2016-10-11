import mongoose from 'mongoose'
import {Router} from 'express'
import passport from 'passport'
import {signToken} from '../auth.service'


const User = mongoose.model("User");
const router = Router()

router.post('/',(req, res, next)=>{

  if(process.env.NODE_ENV !== 'test'){

    let error_msg;
    if (req.body.email ==="" || req.body.password === ''){
       error_msg = "用户名和密码不能为空.";
    }

    if(error_msg){
      return res.status(400).send({error_msg})
    }else{
      next()
    }

  }else{
    next()
  }

}, (req, res, next)=>{
  passport.authenticate('local',(err, user, info)=>{
    if (err){
      return res.status(401).send(err);
    }
    if(info){
      return res.status(403).send(info);
    }
    const token = signToken(user._id)
    return res.json({token})
  })(req, res, next)
})

export default router