import {Router} from 'express'


import * as controller from './comment.controller'
import * as auth from '../../auth/auth.service'

const router = Router()

router.delete('/:id', auth.hasRole('admin'), controller.delComment)
router.delete('/:id/delReply', auth.hasRole('admin'), controller.delReply)

router.post('/addNewComment', auth.isAuthenticated(), controller.addNewComment)
router.post('/:id/addNewReply', auth.isAuthenticated(), controller.addNewReply)
router.get('/:id/getFrontCommentList', controller.getFrontCommentList)

export default router