import {Router} from 'express'
import multer from 'multer'
import * as controller from './article.controller'

import * as auth from '../../auth/auth.service'

const router = Router()
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './public/uploads')
  },
  filename: function(req, file, cb){
    const fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1] )
  }
})
const upload = multer({storage});

//后台
router.post('/uploadImage', auth.hasRole('admin'), upload.single('file'), controller.uploadImage);
router.post('/addArticle', auth.hasRole('admin'), controller.addArticle)
router.get('/getArticleList', auth.hasRole('admin'), controller.getArticleList)
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id', auth.hasRole('admin'), controller.updateArticle);


// front
router.get('/getFrontArticleList', controller.getFrontArticleList)
router.get('/getFrontArticleCount', controller.getFrontArticleCount)
router.get('/:id/getFrontArticle', controller.getFrontArticle)

//user like
router.put('/:id/toggleLike',auth.isAuthenticated(), controller.toggleLike);


export default router
