import {Router} from 'express'
import {signToken} from './auth.service.js'
import mongoose from 'mongoose'
import config from '../config/env'
import localLogin from './local'

import localSetup from './local/passport'

const User = mongoose.model("User")
const router = Router()

localSetup(User, config)

router.use('/login', localLogin)



export default router