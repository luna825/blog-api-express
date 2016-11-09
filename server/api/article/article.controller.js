import mongoose from 'mongoose'
import markdown from 'markdown-it'

import {extractImage} from '../../util/tools'

const Article = mongoose.model('Article');
const User = mongoose.model('User');
const Comment = mongoose.model('Comment');
//上传图片
export function uploadImage(req, res, next){
  const file = req.file
  if(!file){
    return res.status(422).send({err_msg:'缺少文件参数.'})
  }

  return res.status(200).send({success:true, img_url:'/uploads/' + file.filename})
}

//添加文章
export function addArticle(req, res, next){
  const {content, title} = req.body;
  let err_msg;
  if(!title){
    err_msg = '标题不能为空'
  }else if(!content){
    err_msg = '内容不能为空'
  }

  if(err_msg){
    return res.status(422).send({err_msg})
  }

  req.body.images = extractImage(content)
  return Article.create({...req.body,author_id:req.user._id}).then(result => {
    return res.status(200).json({success: true,article_id:result._id});
  }).catch(err => next(err))
}

//获取blogs列表
export function getArticleList(req, res, next){
  const currentPage = parseInt(req.query.currentPage) > 0 ? parseInt(req.query.currentPage) : 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage) > 0 ? parseInt(req.query.itemsPerPage) : 10;
  const startRow = (currentPage - 1) * itemsPerPage;

  let sortName = String(req.query.sortName) || 'publish_time'
  if (req.query.sortOrder === 'false'){
    sortName = '-' + sortName;
  }

  (async function(){
    const count = await Article.count()
    if(!count) { return res.json({msg:'no article'}) }
    const articles = await Article.find().skip(startRow).limit(itemsPerPage).sort(sortName).exec()
    return res.status(200).json({data:articles, count})

  })().catch(err=>next(err))
}

// 删除blog，连同评论一起删除
export function destroy(req, res, next){
  let id = req.params.id;
  (async function(){
    try{
      await Article.findByIdAndRemove(id);
      await Comment.remove({aid:id});
      return res.status(200).send({success: true})
    }catch(e){
      return next(e);
    }
  })();
}

//更新blog
export function updateArticle(req, res, next){
  const id = req.params.id
  if (req.body._id){
    delete req.body._id
  }
  const content = req.body.content;
  const title = req.body.title;
  let err_msg;
  if (!title){
    err_msg = "标题不能为空";
  }else if(!content){
    err_msg = "内容不能为空";
  }

  if(err_msg){
    res.status(422).send({err_msg});
  }

  req.body.images = extractImage(content);
  req.body.updated = new Date();
  if(req.body.isRePub){
    req.body.publish_time = new Date()
  }

  (async function(){
    const article = await Article.findByIdAndUpdate(id, req.body, {new:true})
    return res.status(200).json({success:true, article_id:article.id})
  })().catch(err => next(err))

}

//前台获取blog列表
export function getFrontArticleList(req, res, next){
  const currentPage = parseInt(req.query.currentPage) > 0 ? parseInt(req.query.currentPage) : 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage) > 0 ? parseInt(req.query.itemsPerPage) : 10;
  const startRow = (currentPage - 1) * itemsPerPage;

  let sortName = String(req.query.sortName) || 'publish_time'
  if (req.query.sortOrder === 'false'){
    sortName = '-' + sortName;
  }

  let condition = {status:{$gt:0}};
  if (req.query.tagId){
    let tagId = String(req.query.tagId)
    condition = {...condition, tags:{$elemMatch:{ $eq: tagId }}}
  }

  (async function(){
    const articles = await Article.find(condition).skip(startRow).limit(itemsPerPage).sort(sortName).exec()
    return res.status(200).json({data:articles})

  })().catch(err=>{
    next(err)
  })
}

//前台获取文章数量
export function getFrontArticleCount(req, res, next){
  let condition = {status: {$gt: 0}};
  if (req.query.tagId){
    let tagId = String(req.query.tagId)
    condition = {...condition, tags: {$elemMatch: {$eq: tagId }}}
  }

  (async function(){
    const count = await Article.count();
    return res.status(200).send({success:true, count})
  })().catch(err => next(err))
}

//前台获取文章
export function getFrontArticle(req, res, next){

  const id = req.params.id;
  const md = new markdown({
    html:true
  });
  (async function(){
    const article = await Article.findById(id,'-images')
    article.content = md.render(article.content);
    article.visit_count++;
    await Article.findByIdAndUpdate(id, {$inc: {visit_count: 1}})
    return res.status(200).json({data: article.info})
  })().catch(err=>next(err))

}

export function toggleLike(req, res, next){
  const aid = req.params.id;
  const userId = req.user._id;
  const isLike = req.user.likeList.indexOf(aid);

  let conditionOne,conditionTwo,liked;
  if(isLike !== -1){
    conditionOne = {'$pull':{'likeList': aid }};
    conditionTwo = {'$inc': {'like_count': -1 }};
    liked = false;
  }else{
    conditionOne = {'$addToSet':{'likeList': aid}};
    conditionTwo = {'$inc' : {'like_count': 1 }};
    liked = true;
  }

  (async function(){
    await User.findByIdAndUpdate(userId, conditionOne);
    const article = await Article.findByIdAndUpdate(aid, conditionTwo, {new: true});
    return res.status(200).json({success:true,count:article.like_count,'isLike':liked});
  })().catch(err => next(err))
}