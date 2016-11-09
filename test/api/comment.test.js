import app from '../../server/app'
import mongoose from 'mongoose'
import {expect} from 'chai'
import Request from 'supertest'
import * as authHelper from '../middlewares/authHelper'

const Article = mongoose.model('Article')
const User = mongoose.model("User")
const Logs = mongoose.model('Logs')
const Comment = mongoose.model('Comment')
const request = Request(app)


describe('test/api/comment',()=>{

  let token, mockUserId, mockArticleId, mockCommentId, mockReplyId;

  before((done)=>{
    (async function(){
      const user = await authHelper.createUser('admin');
      mockUserId = user._id;
      token = await authHelper.getToken(request, user.email);

      const article = await Article.create({
        author: user._id,
        title:'第' + new Date().getTime() + '篇文章',
        content:'<p>我第n次爱你.</p>',
        status:1
      })
      mockArticleId = article._id;
      done();
    })().catch(err=>console.log(err))
  });

  after((done)=>{
    (async function(){
      await User.remove();
      await Article.remove();
      await Logs.remove();
      await Comment.remove();
      done();
    })()
  })

  describe('post /comment/addNewComment', ()=>{
    it('shuold not aid return err',(done)=>{
      request.post('/comment/addNewComment')
        .set('Authorization', 'Bearer ' + token)
        .expect(422)
        .end((err,res)=>{
          expect(res.body.err_msg).be.equal('缺少必须参数');
          done()
        })
    })

    it('shuold not content return err',(done)=>{
      request.post('/comment/addNewComment')
        .set('Authorization', 'Bearer ' + token)
        .send({
          aid:mockArticleId,
          content:''
        })
        .expect(422)
        .end((err,res)=>{
          expect(res.body.err_msg).be.equal('评论内容不能为空');
          done()
        })
    })
    it('shuold return a new comment',(done)=>{
      request.post('/comment/addNewComment')
        .set('Authorization', 'Bearer ' + token)
        .send({
          aid:mockArticleId,
          content:'最亲爱的评论'
        })
        .expect(200)
        .end((err,res)=>{
          mockCommentId = res.body.data._id
          expect(res.body.success).to.be.true;
          expect(res.body.data.aid).be.equal(mockArticleId.toString())
          expect(res.body.data.content).be.equal('最亲爱的评论');
          done()
        })
    })
  })

  describe('post /comment/:id/addNewReply',()=>{
    it('shuold no content return err', (done)=>{
      request.post('/comment/' + mockCommentId + '/addNewReply')
        .set('Authorization', 'Bearer ' + token)
        .send({
          content:''
        })
        .expect(422)
        .end((err, res)=>{
          expect(res.body.err_msg).be.equal('回复内容不能为空')
          done();
        })
    })
    it('shuold create a new reply', (done)=>{
      request.post('/comment/' + mockCommentId + '/addNewReply')
        .set('Authorization', 'Bearer ' + token)
        .send({
          content:'最好的回复.'
        })
        .expect(200)
        .end((err, res)=>{
          mockReplyId = res.body.data[0]._id;
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.be.a('array');
          expect(res.body.data[0].content).be.equal('最好的回复.');
          done();
        })
    })
  })


  describe('get /comment/:id/getFrontCommentList', ()=>{
    it('shuold return a comment list',(done)=>{
      request.get('/comment/' + mockArticleId + '/getFrontCommentList')
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.be.a('array')
          done();
        })
    })
  })

  describe('delete /comment/:id/delReply',()=>{
    it('shuold return a comment reply',(done)=>{
      request.delete('/comment/' +mockCommentId + '/delReply')
        .set('Authorization', 'Bearer ' + token)
        .send({
          rid: mockReplyId
        })
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          console.log(res.body.data)
          done();
        })
    })
  })

  describe('delete /comment/:id',()=>{
    it('shuold return success',(done)=>{
      request.delete('/comment/' + mockCommentId )
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          done();
        })
    })
  })

})