import mongoose ,{Schema} from 'mongoose';


const TagCategorySchema = new Schema({
  name:{
    type:String,
    unique:true
  },
  desc: String

})

const TagCategory = mongoose.model('TagCategory', TagCategorySchema)

export default TagCategory