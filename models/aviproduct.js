import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {productId :{
        type : String,
        required : true,
        description : true
    },
    name : {
        type : String,
        required : true,
        description : true
    },
    altName : [
        {type : String}
    ],
    description : {
        type : String,
        required : true
    },
    images : [
        {type : String}
    ],
    labelledPrice : {
        type : String,
        required : true
    },
    price : {
        type : String,
        required : true
    },
    stock : {
        type : String,
        required : true,
        default : true
    },

    }
);

const Product = mongoose.model("products",productSchema)

export default Product;