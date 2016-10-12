import app from '../../server/app'
import mongoose from 'mongoose'

import Request from 'supertest'
import {Should} from 'chai'
import * as authHelper from '../middlewares/authHelper'

const User = mongoose.model("User")
const Logs = mongoose.model('Logs')
const request = Request(app)
const should = Should()

describe('test/api/user', ()=>{
  let token,mockUserId,mockAdminId,mockNickname,mockUpdateNickName,mockAdminNickname;

  before((done)=>{

    (async function(){

      const user = await authHelper.createUser('admin')
      mockAdminId = user._id
      mockNickname = user.nickname
      token = await authHelper.getToken(request, user.email)
      done();
    })().catch(err => console.log(err))

  });

  after((done)=>{

    (async function(){
      await User.remove()
      await Logs.remove()
      done()
    })()

  })

  describe('post /users/addUser', ()=>{

    mockNickname = '呢称' + new Date().getTime();

    it('should when not email return error',(done)=>{
      request.post('/users/addUser')
        .set('Authorization','Bearer ' + token)
        .send({
          nickname: "呢称" + new Date().getTime(),
          password:'test'
        })
        .expect(422,done)
    })

    it('should when not password return error',(done)=>{
      request.post('/users/addUser')
        .set('Authorization','Bearer ' + token)
        .send({
          nickname: "呢称" + new Date().getTime(),
          email:'test'
        })
        .expect(422)
        .end((err, res)=>{
          should.exist(res.body.err_msg)
          res.body.err_msg.should.equal("密码不能为空")
          done()
        })
    })

    it('should when email error return error',(done)=>{
      request.post('/users/addUser')
        .set('Authorization','Bearer ' + token)
        .send({
          email:'test23232',
          password:'test'
        })
        .expect(422)
        .end((err, res)=>{
          should.exist(res.body.err_msg)
          res.body.err_msg.should.equal("邮箱地址不合法")
          done()
        })
    })

  })


})