import app from '../../server/app'
import mongoose from 'mongoose'
import {expect} from 'chai'
import Request from 'supertest'
import * as authHelper from '../middlewares/authHelper'

const User = mongoose.model("User")
const Logs = mongoose.model('Logs')
const request = Request(app)

describe('test/api/logs', ()=>{

  let token;
  before((done)=>{
    (async function(){
      const user = await authHelper.createUser('admin');
      token = await authHelper.getToken(request, user.email);
      await Logs.create({
        content:'删除用户.',
        uid:user._id,
        type:'user'
      },{
        content:'删除文章.',
        uid:user._id,
        type:'article'
      });
      done();
    })().catch(err => console.log(err))

  })

  after((done)=>{
    (async function(){
      await User.remove();
      await Logs.remove();
      done();
    })()
  })

  describe('get /logs/getLogsList', ()=>{

    it('should return logs list', (done)=>{
      request.get('/logs/getLogsList')
        .query({
          access_token: token
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{
          if (err) { return done(err) }
          expect(res.body.data).to.exist;
          expect(res.body.data).to.have.length.above(0);
          done();
        })
    })

    it('should when sort desc return logs list', (done)=>{
      request.get('/logs/getLogsList')
        .query({
          access_token: token,
          itemsPerPage:1,
          currentPage:2,
          sortOrder:false,
          sortName:''
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{
          if (err) { return done(err) }
          expect(res.body.data).to.exist;
          expect(res.body.data).to.have.length.above(0);
          expect(res.body.count).to.be.above(1)
          done();
        })
    })

  })

})