import {Should} from 'chai'

import mongoose from 'mongoose'
const User = mongoose.model('User');
const should = Should()

export function createUser(role, nickname, status){

  return User.create({
    nickname: nickname || '测试' + new Date().getTime(),
    email: 'test' + new Date().getTime() + '@tets.com',
    password: 'test',
    role: role || 'admin',
    status: status || 1
  })

}

export function getToken(agent, email){

  return new Promise((resolve, reject) =>{
    agent.post('/auth/login')
          .set("Content-Type", "application/json")
          .send({ email: email, password:'test' })
          .redirects(0)
          .expect(200)
          .end((err, res) =>{
            if (err) { reject(err)}
            should.exist(res.body)
            should.exist(res.body.token)
            resolve(res.body.token)
          })
  })

}