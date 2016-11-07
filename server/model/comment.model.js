import mongoose, {Schema} from 'mongoose'

const CommentSchema = new Schema({
  aid:{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  },
  user_id:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  replys:[{
    content: String,
    user_info:Object,
    created: Date
  }],
  status:{
    type:Number,
    default:1
  },
  created:{
    type:Date,
    default:Date.now
  },
  update:{
    type:Date,
    default:Date.now
  }
})

const Comment = mongoose.model('Comment', CommentSchema)