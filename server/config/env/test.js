
export default ({
  mongo:{
    uri: 'mongodb://localhost/blog-test'
  },
  seedDB: true,
  port: process.env.PORT || 8080
})