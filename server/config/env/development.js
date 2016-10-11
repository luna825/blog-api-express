
export default ({
  mongo:{
    uri: 'mongodb://localhost/blog-dev'
  },
  seedDB: true,
  session:{
    cookie:  {maxAge: 60000*5},
    secret: 'blog-secret',
  }
})