import express from 'express'
import compression from 'compression' //压缩中间件
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import passport from 'passport'

import path from 'path'
import config from './env'

export default (app)=>{

  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(passport.initialize())
  app.use(express.static(path.join(config.root,'public')))
}