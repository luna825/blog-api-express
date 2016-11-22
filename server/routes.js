import userRouter from './api/user'
import loginRouter from './auth'
import logsRouter from './api/logs'
import articleRouter from './api/article'
import commentRouter from './api/comment'
import tagRouter from './api/tags'

export default (app) => {
  app.use('/users',userRouter);
  app.use('/auth', loginRouter);
  app.use('/logs', logsRouter);
  app.use('/article', articleRouter);
  app.use('/comment', commentRouter);
  app.use('/tag', tagRouter)
}