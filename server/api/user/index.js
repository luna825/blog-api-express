import {Router} from 'express'
import * as controller from './user.controller'

import * as auth from '../../auth/auth.service'

const router = Router()


router.get('/getUserList',auth.hasRole("admin") ,controller.getUserList)
router.post('/addUser',auth.hasRole("admin"), controller.addUser)
router.delete('/delete/:id', auth.hasRole('admin'), controller.destroy)
router.put('/updateUser/:id', auth.hasRole('admin'), controller.updateUser)

//前台用户更新信息
router.get('/getMe',auth.isAuthenticated(), controller.getMe)


export default router