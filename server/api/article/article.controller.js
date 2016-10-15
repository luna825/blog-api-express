import mongoose from 'mongoose'

const Article = mongoose.model('Article')

//上传图片
export function uploadImage(req, res, next){
  const file = req.file
  if(!file){
    return res.status(422).send({err_msg:'缺少文件参数.'})
  }

  return res.status(200).send({success:true, img_url:'/uploads/' + file.filename})
}