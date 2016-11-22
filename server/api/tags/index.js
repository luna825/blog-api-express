import {Router} from 'express';
import * as controller from './tags.controller';
import * as auth from '../../auth/auth.service';


const router = Router()

router.post('/addTagCat', auth.hasRole('admin'), controller.addTagCat)
router.put('/:id/updateTagCat', auth.hasRole('admin'), controller.updateTagCat)
router.get('/getTagCatList', auth.hasRole('admin') ,controller.getTagCatList)
router.delete('/:id/delTagCat', auth.hasRole('admin'), controller.delTagCat)

router.post('/addTag', auth.hasRole('admin'), controller.addTag)
router.put('/:id/updateTag', auth.hasRole('admin'), controller.updateTag)
router.delete('/:id/delTag', auth.hasRole('admin'), controller.delTag)
router.get('/getTagList', controller.getTagList)
export default router