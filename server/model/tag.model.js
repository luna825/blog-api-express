import mongoose, {Schema} from 'mongoose'

const TagSchema = new Schema({
  name:{
    type:String,
    unique: true,
  },
  cid:{
    type:Schema.Types.ObjectId,
    ref: 'TagCategory'
  },
  is_index:{
    type:Boolean,
    default : false
  },
  is_show:{
    type:Boolean,
    default: false
  },
  sort:{
    type: Number,
    default: 1
  }
});

const Tag = mongoose.model('Tag', TagSchema)

export default Tag