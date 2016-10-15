import userRouter from './api/user'
import loginRouter from './auth'
import logsRouter from './api/logs'
import articleRouter from './api/article'

export default (app) => {
  app.use('/users',userRouter);
  app.use('/auth', loginRouter);
  app.use('/logs', logsRouter);
  app.use('/article', articleRouter)
}