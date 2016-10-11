
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import expressJWT from 'express-jwt'
import compose from 'composable-middleware'

import config from '../config/env'

const User = mongoose.model('User')


//验证token
export function authToken(credentialsRequired){
  return compose()
          .use((req, res, next) =>{
            if(req.query && req.query.access_token){
              req.headers.authorization = 'Bearer ' + req.query.access_token;
            }
            next()
          })
          .use(expressJWT({
            secret: config.session.secret,
            credentialsRequired
          }))
}

export function isAuthenticated(){
  return compose()
          .use(authToken(true))
          .use((err, req, res, next)=>{
            if (err.name === "UnauthorizedError"){
              return res.status(401).send({err:err })
            }
            next();
          })
          .use((req, res, next)=>{
            (async function(){
              const user = await User.findById(req.user._id).exec()
              if(!user){
                return res.status(401).send
              }
              req.user = user
              next()
            })().catch(err => console.log(err))

          })
}

export function hasRole(roleRequired){
  if (! roleRequired ) throw new Error('Required role needs to be set');

  return compose()
          .use(isAuthenticated())
          .use((req, res, next) => {
            if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
              next();
            }
            else {
              return res.status(403).send();
            }
          })
}


/**
 * 生成token
 */
export function signToken(id) {
  return jwt.sign({ _id: id }, config.session.secret, { expiresIn: '1y' });
}