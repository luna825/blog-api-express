import {Router} from 'express';
import * as controller from './logs.controller';
import * as auth from '../../auth/auth.service';


const router = Router()

router.get('/getLogsList', auth.hasRole("admin"), controller.getLogsList)

export default router