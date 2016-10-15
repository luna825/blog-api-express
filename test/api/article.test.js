import app from '../../server/app'
import mongoose from 'mongoose'
import {expect} from 'chai'
import Request from 'supertest'
import * as authHelper from '../middlewares/authHelper'

const Article = mongoose.model('Article')
const User = mongoose.model("User")
const Logs = mongoose.model('Logs')
const request = Request(app)

describe('test/api/article', ()=>{

  let token,mockAdminId,mockAdminEmail;

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
      await User.remove();
      await Article.remove();
      await Logs.remove();
      done();
    })()
  });

  describe('upload image', ()=>{

    it('should not file parmas return error', (done)=>{
      request.post('/article/uploadImage')
        .set('Authorization','Bearer ' + token)
        .expect(422,done)
    })

    it('should return success', (done)=>{
      request.post('/article/uploadImage')
        .set('Authorization','Bearer ' + token)
        .attach('file', __dirname + '/upload.test.png')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res)=>{
          if(err) return done(err);
          expect(res.body.success).to.be.true;
          expect(res.body.img_url).to.be.a('string')
          done();
        })
    })

  })

})