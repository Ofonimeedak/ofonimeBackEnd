const mongoose = require('mongoose');
const bcrypt=require('bcryptjs')



const userSchema = new mongoose.Schema(

{
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },

    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },

    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    
      password:{
        type:String,
        required:[true,'Password is required'],
        select:false,
    
    },

    id: {type:String,
        required:false
    },

    temp_secret:{ type: Object,
                  required:false
    },
    secret:{type: Object,
            required:false
    },

    qrcode:{type: String,
            required:false
    }

},

{
    timestamps: true
});

//middleware for Password encryption
    userSchema.pre('save', async function(next) {
    
    // do not run this function if password is not modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  
    // Delete passwordConfirm property
    // this.passwordConfirm = undefined;
    
});

//To compare provided password and original password for login authentication
userSchema.methods.correctPassword = async function (candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};


//create a model out of the schema
const UserModel = mongoose.model('User', userSchema);


module.exports = UserModel;
