import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    email : {
        type : String,
        required :true
    },
    username: { 
        type: String, 
        required: true 
    },
    
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        required : true,
        default : "customer"
    },
    isBlock : {
        type : Boolean,
        required : true,
        default : false
    },
    img : {
        type : String,
        required : false,
        default : ""
    },
    
},{ timestamps: true });

const User = mongoose.model("users" , userSchema);

export default User;