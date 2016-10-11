

import path from 'path'
import fs from 'fs'

const all = {
  env: process.env.NODE_ENV,
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 9000,
  // mongodb配置
  mongo: {
    options: {
      user: process.env.MONGO_USERNAME || '', 
      pass: process.env.MONGO_PASSWORD || ''
    }
  },
  seedDB: false,
  session:{
    secret: 'blog-secret',
  },
  userRoles: ["user", "admin"]
}

const config = {...all, ...require('./'+ process.env.NODE_ENV + '.js').default}

export default config