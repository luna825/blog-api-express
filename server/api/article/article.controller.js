import mongoose from 'mongoose'

import {extractImage} from '../../util/tools'

const Article = mongoose.model('Article')
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