import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import aviproductRouter from './routes/aviproductRouter.js';
import aviuserRouter from './routes/aviuserRouter.js';
import aviorderRouter from './routes/aviorderRouter.js';

app.use((req,res,next)=>{
    const tokenString = req.header("Authorization")
    if(tokenString != null){
        const token = tokenString.replace("Bearer" ,"")
  

    jwt.verify(token, process.env.JWT_KEY, 
        (err,decoded)=>{
            if(decoded != null){
                req.user = decoded
                next()
            }
            else{
                 console.log("Invalid token")
                 res.status(403).json({
                    message : "Invalid token"
                 })
                 
            }
        }
    )
    }else{
        next()
    }
    //next()

})

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("Connect to the database")
}
).catch(()=>{
    console.log("Database connection failed")
})

app.use("/api/products" , aviproductRouter)
app.use("/api/users" , aviuserRouter)
app.use("/api/orders" , aviorderRouter)

// Start server
app.listen(5000, 
    () => {
    console.log("Server is running on port 5000");
});
