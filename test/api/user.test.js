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
  let token,mockUserId,mockAdminId,mockEmail,mockUpdateNickName,mockAdminEmail;

  before((done)=>{

    (async function(){

      const user = await authHelper.createUser('admin')
      mockAdminId = user._id
      mockAdminEmail = user.email
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

    it('should return new user',(done)=>{
      request.post('/users/addUser')
        .set('Authorization','Bearer ' + token)
        .send({
          email:'test' + new Date().getTime() + '@test.com',
          password:'test'
        })
        .expect(200)
        .end((err, res)=>{
          if (err) { done (err) }
          should.exist(res.body)
          res.body.user_id.should.be.a('string');
          res.body.success.should.to.be.true
          mockUserId = res.body.user_id
          done()
        })
    })


    it('should same email return error',(done)=>{
      request.post('/users/addUser')
        .set('Authorization','Bearer ' + token)
        .send({
          email:mockAdminEmail,
          password:'test'
        })
        .expect(500)
        .end((err, res)=>{
          if (err) { done (err) }
          should.exist(res.error)
          res.error.text.should.equal('email is used!')
          done()
        })
    })

  })

  describe('get /users/getUserList',()=>{

    it('should return a list', (done)=>{
      request.get('/users/getUserList')
        .set('Authorization','Bearer ' + token)
        .query({
          itemsPerPage:1,
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{

          if(err) { done(err) }

          res.body.data.should.to.have.length.above(0)
          res.body.data.length.should.equal(1)
          res.body.count.should.to.be.above(0)

          done()
        })
    })
  })

  describe('get /users/getMe',()=>{

    it('should return user info', (done)=>{
      request.get('/users/getMe')
        .set('Authorization','Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{

          if(err) { return done(err) }
          res.body.should.exist;
          res.body.email.should.equal(mockAdminEmail)
          res.body.nickname.should.to.be.a('string')

          done()
        })
    })
  })


  describe('put /users/updateUser/:id', ()=>{

    mockUpdateNickName = 'nick' + new Date().getTime();

    it('should when no nickname return error', (done)=>{

      request.put('/users/updateUser/' + mockUserId )
        .set('Authorization','Bearer ' + token)
        .send({
          status:2,
          newPassword:'nick'
        })
        .expect(422)
        .end((err, res)=>{
          if (err) return done(err)
          res.body.err_msg.should.equal('呢称不能为空')
          done()
        })
    })

    it('should when nick error return error', (done)=>{

      request.put('/users/updateUser/' + mockUserId )
        .set('Authorization','Bearer ' + token)
        .send({
          nickname:'jac^^%%',
          status:2
        })
        .expect(422)
        .end((err, res)=>{
          if (err) return done(err)
          res.body.err_msg.should.equal('呢称不合法')
          done()
        })
    })

    it('should return update user',(done)=>{

      request.put('/users/updateUser/' + mockUserId )
        .set('Authorization','Bearer ' + token)
        .send({
          nickname:mockUpdateNickName,
          status:2,
          newPassword:'jack'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{
          res.body.success.should.to.be.true;
          done();
        })
    })

  })

  describe('del /users/delete/:id', ()=>{

    it('should delete self return err', (done)=>{
      request.delete('/users/delete/' + mockAdminId)
        .set('Authorization','Bearer ' + token)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res)=>{
          if(err) return done(err)
          res.body.message.should.equal('不能删除自己已登录帐号')
          done()
        })
    })

    it('should if userId error return error', (done)=>{
      request.delete('/users/delete/dddddd')
        .set('Authorization','Bearer ' + token)
        .expect(500, done)
    })

    it('should delete success return true', (done)=>{
      request.delete('/users/delete/' + mockUserId)
        .set('Authorization','Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{
          if(err) return done(err);
          res.body.success.should.to.be.true;
          done()
        })
    })


  })


})                                                                                                                                                                                          