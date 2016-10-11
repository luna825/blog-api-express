import userRouter from './api/user'
import loginRouter from './auth'

export default (app) => {
  app.use('/users',userRouter)
  app.use('/auth', loginRouter)
}