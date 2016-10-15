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

router.post('/uploadImage', auth.hasRole('admin'), upload.single('file'), controller.uploadImage);

export default router
