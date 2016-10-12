import mongoose, {Schema} from 'mongoose'


const LogsSchema = new Schema({

  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content:{
    type: String,
    trim: true
  },
  type: String,
  created:{
    type: Date,
    default: Date.now
  }
})

const Logs = mongoose.model('Logs', LogsSchema)

export default Logs