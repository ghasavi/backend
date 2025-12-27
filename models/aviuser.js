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
    cart: [
        {
            productId: { type: String, required: true },
            name: { type: String, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            labelledPrice: { type: Number },
            qty: { type: Number, default: 1 }
        }
    ]
    
},{ timestamps: true });

const User = mongoose.model("users" , userSchema);

export default User;