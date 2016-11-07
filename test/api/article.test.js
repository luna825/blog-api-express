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

describe('test/api/article', ()=>{

  let token,mockAdminId,mockAdminEmail,mockArticleId;

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


  describe('post /article/addArticle',()=>{

    it('should no title return error', (done)=>{
      request.post('/article/addArticle')
        .set('Authorization','Bearer ' + token)
        .send({
          content:'测试文章内容![enter image description here](http://upload.jackhu.top/test/111.png "enter image title here")',
          stauts:1
        })
        .expect(422)
        .end((err, res)=>{
          if(err) return done(err);
          expect(res.body.err_msg).equal('标题不能为空');
          done();
        })
    })

    it('should no content return error', (done)=>{
      request.post('/article/addArticle')
        .set('Authorization','Bearer ' + token)
        .send({
          title:'test',
          stauts:1
        })
        .expect(422)
        .end((err, res)=>{
          if(err) return done(err);
          expect(res.body.err_msg).equal('内容不能为空');
          done();
        })
    })

    it('should create a new article', (done)=>{
      request.post('/article/addArticle')
        .set('Authorization','Bearer ' + token)
        .send({
          title:'测试文章标题' + new Date().getTime(),
          content:'测试文章内容![enter image description here](http://upload.jackhu.top/test/111.png "enter image title here")',
          status:1
        })
        .expect(200)
        .end((err, res)=>{
          if(err) return done(err);
          mockArticleId = res.body.article_id
          expect(res.body.success).to.be.true;
          expect(mockArticleId).to.be.a('string')
          Article.findById(mockArticleId).populate('author_id').then(article=>{
            expect(article.author_id.email).equal(mockAdminEmail)
            expect(article.images).to.be.not.empty;
          })
          done();
        })
    })

  })


  describe('get /article/getArticleList', ()=>{

    it('should return blog list', (done)=>{
      request.get('/article/getArticleList')
        .set('Authorization','Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res)=>{
          if(err) return done(err);
          expect(res.body.data).to.have.length.above(0)
          expect(res.body.count).to.be.above(0)
          expect(res.body.count).to.be.a('number')
          done();
        })
    })

    it('should return sort blog list', (done)=>{
      request.get('/article/getArticleList')
      .set('Authorization','Bearer ' + token)
      .query({
        sortOrder:'false',
        sortName:'visit_count',
        itemsPerPage:2
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err,res) {
        if(err) return done(err);
        res.body.data.length.should.be.above(0);
        res.body.count.should.be.Number;
        res.body.count.should.be.above(0);
        done();
      });
    })
  })


  describe('delete /article/:id',()=>{

    it('should when id err return err', (done)=>{
      request.del('/article/ddd')
        .set('Authorization','Bearer ' + token)
        .expect(500, done)
    })
    it('should return success', (done)=>{
      request.del('/article/' + mockArticleId)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function (err, res){
          if (err) return done(err);
          expect(res.body.success).to.be.true;
          done()
        })



    })
  })



  describe.skip('upload image', ()=>{

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