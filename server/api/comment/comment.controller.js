import mongoose from 'mongoose';

const Comment = mongoose.model('Comment');
const Article = mongoose.model('Article');

//add a new comment
export function addNewComment(req, res, next){
  const aid = req.body.aid, content = req.body.content, userId = req.user._id;
  let err_msg;
  if(!aid){
    err_msg = '缺少必须参数';
  }else if(!content || content == ''){
    err_msg = "评论内容不能为空";
  }

  if(err_msg){
    return res.status(422).send({err_msg})
  }

  (async function(){
    const comment = await Comment.create({
      aid: aid,
      content:content,
      user_id: userId
    });
    comment.user_id ={
      _id: req.user._id,
      nickname: req.user.nickname,
      avatar: req.user.avatar
    }
    await Article.findByIdAndUpdate(aid,{$inc:{comment_count: 1}});
    return res.status(200).json({success:true, data:comment});
  })().catch(err => next(err))
}

//get the comment list
export function getFrontCommentList(req, res, next) {
  const aid = req.params.id;
  (async function(){
    const comments = await Comment.find({aid:aid, status:{$eq: 1 }})
                            .populate({path:'user_id', select:'nickname avatar'});
    return res.status(200).json({success:true, data: comments})

  })().catch(err=>next(err))
}

//add a commment reply
export function addNewReply(req, res, next){
  const cid = req.params.id;
  if (!req.body.content || req.body.content === ''){
    return res.status(422).send({err_msg:"回复内容不能为空"});
  }

  let reply = req.body;
  reply.user_info = {
    id : req.user._id,
    nickname : req.user.nickname
  }
  reply.created = new Date();
  (async function(){
    const result = await Comment.findByIdAndUpdate(cid, {$push:{replys:reply}}, {new: true})
    return res.status(200).json({success:true, data:result.replys})
  })().catch(err=>next(err))
}

//delete a comment
export function delComment(req, res, next){

  const cid = req.params.id;
  (async function(){
    const result = await Comment.findByIdAndRemove(cid);
    
    await Article.findByIdAndUpdate(result.aid,{$inc: {comment_count: -1 }});

    return res.status(200).json({success:true})
  })().catch(err=>next(err))
}

//delete a comment reply
export function delReply(req, res, next){
  const cid = req.params.id;
  const rid = req.body.rid;
  if (!rid){
    return res.status(422).send({err_msg:"缺少回复ID."});
  }
  (async function(){
    const result = await Comment.findByIdAndUpdate(cid, {$pull:{ replys: {_id:mongoose.Types.ObjectId(rid)}}},{new:true})
    return res.status(200).json({success:true, data:result.replys})
  })().catch(err=>next(err))
}