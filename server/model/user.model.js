import mongoose, {Schema} from 'mongoose'
import crypto from 'crypto'


const UserSchema = new Schema({
  nickname: String,
  email:{
    type: String,
    lowercase: true
  },
  provider:{
    type: String,
    default: 'local'
  },
  hashedPassword: String,
  salt: String,
  role:{
    type: String,
    default: 'user'
  },
  avatar: String,
  status:{
    type: Number,
    default: 0
  },
  created:{
    type: Date,
    default: Date.now
  },
  update:{
    type: Date,
    default: Date.now
  }
})

// virtuals
UserSchema.virtual('password')
  .set(function(password){
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function(){
    return this._password;
  })

UserSchema
  .virtual('userInfo')
  .get(function() {
    return {
      'nickname': this.nickname,
      'role': this.role,
      'email': this.email,
      'avatar': this.avatar,
      'provider':this.provider
    };
  });

UserSchema.virtual('token')
  .get(function(){
    return {
      _id: this._id,
      role: this.role
    }
  })

UserSchema.path('email')
  .validate(async function(value, cb){
      let self = this;
      let user = await this.constructor.findOne({email: value}).exec()
      if (user) {
        if (self.id === user.id){ return cb(true) }
        cb(false)
      }
      cb(true)
    }, 'email is used!')

UserSchema.methods = {
  makeSalt: function(){
    return crypto.randomBytes(16).toString('base64');
  },
  encryptPassword: function(password){
    if (!password || !this.salt ) return '';
    let salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
  },
  
  hasRole: function(role) {
    var selfRoles = this.role;
    return (selfRoles.indexOf('admin') !== -1 || selfRoles.indexOf(role) !== -1);
  },
  //验证用户密码
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  }
}

UserSchema.set('toObject', { virtuals: true });
const User = mongoose.model('User', UserSchema);

export default User
