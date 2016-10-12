
//设置默认环境
process.env.NODE_ENV = process.env.NODE_ENV || "development"
import express from 'express'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import config from './config/env'
import {User, Logs} from './model'
import getApp from './config/express'
import getRoute from './routes'
import errorHandler from 'errorhandler'

//连接数据库
mongoose.connect(config.mongo.uri, config.mongo.options);

mongoose.Promise = global.Promise;



if(config.seedDB) { require('./config/seed'); }

const app = express()

getApp(app)
getRoute(app)


if ('development' === config.env) {
  app.use(errorHandler());
}else{
  app.use(function (err, req, res, next) {
    return res.status(500).send();
  });
}

app.listen(config.port, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

export default app