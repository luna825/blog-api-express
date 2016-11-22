import mongoose from 'mongoose'

const TagCategory = mongoose.model('TagCategory')
const Tag = mongoose.model('Tag')
//添加分类
export function addTagCat(req, res, next){
  const catName = req.body.name;
  if(!catName){
    return res.status(422).send({err_msg:"标签分类名称不能为空."})
  }
  (async function(){
    const tagCat = await TagCategory.findOne({name:catName});

    if(tagCat){
      return res.status(403).send({err_msg:"分类名已存在."})
    }else{
      const newTagCat = await TagCategory.create(req.body)
      return res.status(200).json({success:true, tagCat:newTagCat})
    }
  })().catch(err=>next(err))
}
//更新分类
export function updateTagCat(req, res, next){
  const id = req.params.id;
  if (req.body._id){
    delete req.body._id;
  }
  (async function(){
    const result = await TagCategory.findByIdAndUpdate(id, req.body, {new: true})
    res.status(200).json({success:true, cat_id: result._id})
  })().catch(err=>next(err))
}
//获取分类列表
export function getTagCatList(req, res, next){
  (async function(){
    const catList = await TagCategory.find()
    return res.status(200).json({success:true, data:catList})
  })().catch(err=>next(err))
}

//删除分类
export function delTagCat(req, res, next){
  const id = req.params.id;
  (async function(){
    const tag = await Tag.findOne({cid: id})
    if (tag){
      return res.status(403).send({err_msg: "此分类下有标签不可删除."})
    }else{
      const result = await TagCategory.findByIdAndRemove(id)
      return res.status(200).json({success:true, data:result})
    }
  })().catch(err=>next(err))
}


//添加标签
export function addTag(req, res, next){
  const cid = req.body.cid,
        tagName = req.body.name;
  let err_msg;
  if(!tagName){
    err_msg = "标签名称不能为空.";
  }else if(!cid){
    err_msg = "必须选择一个标签分类.";
  }

  if(err_msg){
    return res.status(422).send({err_msg:err_msg});
  }

  (async function(){
    const tag = await Tag.findOne({name: tagName})
    if (tag){
      return res.status(403).send({err_msg: '标签名称已经存在.'})
    }else{
      const result = await Tag.create(req.body)
      return res.status(200).json({success:true, data: result})
    }
  })().catch(err=>next(err))
}

//更新标签
export function updateTag(req, res, next){
  const id = req.params.id;
  if( req.body._id){
    delete req.body._id;
  }

  (async function(){
    const result = await Tag.findByIdAndUpdate(id, req.body, {new: true});
    return res.status(200).json({success:true, data:result})
  })().catch(err=>next(err))
}

//删除标签
export function delTag(req, res, next){
  const id = req.params.id;

  (async function (){
    const result = await Tag.findByIdAndRemove(id)
    if(result){
      return res.status(200).json({success:true, data:result})
    }else{
      return res.status(500).send({err_msg:'标签不存在.'})
    }
  })().catch(err => next(err))
}

//获取标签
export function getTagList(req, res, next){
  (async function (){
    const result = await Tag.find()
    return res.status(200).json({data:result})
  })().catch(err => next( err ))
}