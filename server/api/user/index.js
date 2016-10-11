import {Router} from 'express'
import * as controller from './user.controller'

import * as auth from '../../auth/auth.service'

const router = Router()


router.get('/getUserList',auth.hasRole("admin") ,controller.getUserList)


export default router