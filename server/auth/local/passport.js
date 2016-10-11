import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'


export default function localSetup(User, config){
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },(email, password, done)=>{

    (async function(){

      const user = await User.findOne({email:email.toLowerCase()}).exec()

      if (!user){
        return done(null, false, {err_msg: "用户名错误"})
      }
      if (!user.authenticate(password)){
        return done(null, false, {err_msg: "密码错误"})
      }
      if(user.status === 2){

        return done(null, false, { error_msg: '用户被阻止登录.' });
      }
      if(user.status === 0){

        return done(null, false, { error_msg: '用户未验证.' });
      }
      return done(null, user);
    })().catch(err => console.log(err))

  }))
}