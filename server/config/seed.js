import mongoose from 'mongoose'

const User = mongoose.model('User')

if(process.env.NODE_ENV === 'development'){
  (async function(){
      let count = await User.count()
      if ( count === 0){
        await User.remove()
        await User.create({
                nickname:'admin',
                email:'admin@admin.com',
                role:'admin',
                password:'admin',
                status:1
              },{
                nickname:'test1',
                email:'test001@test.com',
                role:'user',
                password:'test',
                status:1
              },{
                nickname:'test2',
                email:'test002@test.com',
                role:'user',
                password:'test',
                status:2
              },{
                nickname:'test3',
                email:'test003@test.com',
                role:'user',
                password:'test',
                status:0
              })
      }
    })()
}