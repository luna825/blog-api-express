import app from '../../server/app'
import mongoose from 'mongoose'
import {expect} from 'chai'
import Request from 'supertest'
import * as authHelper from '../middlewares/authHelper'

const User = mongoose.model("User")
const Logs = mongoose.model('Logs')
const TagCategory = mongoose.model('TagCategory')
const Tag = mongoose.model('Tag')
const request = Request(app)

describe('test/api/tags', ()=>{
  let token, mockUserId, mockTagCatId, mockTagId;
  before((done)=>{
    (async function(){
      const user = await authHelper.createUser('admin');
      mockUserId = user._id;
      token = await authHelper.getToken(request, user.email);
      done();
    })().catch(err=>console.log(err))
  });

  after((done)=>{
    (async function(){
      await User.remove();
      await Logs.remove();
      await TagCategory.remove();
      await Tag.remove();     
      done();
    })().catch(err=>console.log(err))
  });

  describe('post /tag/addTagCat',()=>{
    const catName = '标签分类名' + new Date().getTime();
    it('should not name return err',(done)=>{

      request.post('/tag/addTagCat')
        .set('Authorization', 'Bearer ' + token)
        .send({
          desc:"test"
        })
        .expect(422,done);
    })
    it('should return a new tag category', (done)=>{
      request.post('/tag/addTagCat')
        .set('Authorization', 'Bearer ' + token)
        .send({
          name:catName,
          desc:'test'
        })
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.tagCat.name).be.equal(catName)
          mockTagCatId = res.body.tagCat._id
          done();
        })
    })
  })

  describe('put /tag/:id/updateTagCat', ()=>{
    it('should return update TagCategory', (done)=>{
      request.put('/tag/' + mockTagCatId + '/updateTagCat')
        .set('Authorization', 'Bearer ' + token)
        .send({
          name:'新的标签分类名称' + new Date().getTime(),
          desc:'新的描述'
        })
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.cat_id).be.equal(mockTagCatId)
          done()
        })
    })
  })

  describe('get /tag/getTagCatList', ()=>{
    it('should return a TagCategory list', (done)=>{
      request.get('/tag/getTagCatList')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.be.a('array');
          done();
        })
    })
  })

  describe('post /tag/addTag', ()=>{
    const tagName = '标签名' + new Date().getTime();
    it('should no tagName return err', (done)=>{
      request.post('/tag/addTag')
        .set('Authorization', 'Bearer ' + token)
        .send({
          cid: mockTagCatId,
          is_show:true
        })
        .expect(422)
        .end((err, res)=>{
          expect(res.body.err_msg).be.equal("标签名称不能为空.")
          done();
        })
    })

    it('should no cid return err', (done)=>{
      request.post('/tag/addTag')
        .set('Authorization', 'Bearer ' + token)
        .send({
          name:tagName,
          is_show: true
        })
        .expect(422)
        .end((err, res)=>{
          expect(res.body.err_msg).be.equal('必须选择一个标签分类.');
          done();
        })
    })

    it('should return a new Tag', (done)=>{
      request.post('/tag/addTag')
        .set('Authorization', 'Bearer ' + token)
        .send({
          cid: mockTagCatId,
          name:tagName,
          is_show:true
        })
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          expect(res.body.data.name).be.equal(tagName);
          mockTagId = res.body.data._id
          done();
        })
    })

    it('should add a same tage return err', (done)=>{
      request.post('/tag/addTag')
        .set('Authorization', 'Bearer ' + token)
        .send({
          cid:mockTagCatId,
          name:tagName,
          is_show:true
        })
        .expect(403)
        .end((err, res)=>{
          expect(res.body.err_msg).be.equal('标签名称已经存在.')
          done();
        })
    })
  })

  describe('put /tag/:id/updateTag', ()=>{
    it('should return a new Tag', (done)=>{
      request.put('/tag/' + mockTagId + '/updateTag')
        .set('Authorization', 'Bearer ' + token)
        .send({
          name:'新的标签' + new Date().getTime()
        })
        .expect(200)
        .end((err, res)=>{
          expect(res.body.data._id).be.equal(mockTagId)
          done()
        })
    })
  })

  describe('get /tag/getTagList', ()=>{
    it('should return a tag list', (done)=>{
      request.get('/tag/getTagList')
        .expect(200)
        .end((err, res)=>{
          expect(res.body.data).to.be.a('array')
          done();
        })
    })
  })

  describe('del /tag/:id/delTag and delTagCat',()=>{
    it('should return err where tagCat has tag',(done)=>{
      request.delete('/tag/' + mockTagCatId + '/delTagCat')
        .set('Authorization', 'Bearer ' + token)
        .expect(403)
        .end((err, res)=>{
          expect(res.body.err_msg).be.equal('此分类下有标签不可删除.')
          done();
        })
    })
    it('should return err when id is error',(done)=>{
      request.delete('/tag/' + mockTagCatId + '/delTag')
        .set('Authorization', 'Bearer ' + token)
        .expect(500,done)
    })
    it('should return success', (done)=>{
      request.delete('/tag/' + mockTagId + '/delTag' )
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          done();
        })
    })
    it('should return success when delete empty tagCat', (done)=>{
      request.delete('/tag/' + mockTagCatId +'/delTagCat')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res)=>{
          expect(res.body.success).to.be.true;
          done();
        })
    })
  })

})