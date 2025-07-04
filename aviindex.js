import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import aviproductRouter from './routes/aviproductRouter.js';
import aviuserRouter from './routes/aviuserRouter.js';
import aviorderRouter from './routes/aviorderRouter.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const app = express();

app.use(cors())
// Middleware to parse JSON
app.use(bodyParser.json());

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

app.use("/products" , aviproductRouter)
app.use("/users" , aviuserRouter)
app.use("/orders" , aviorderRouter)

// Start server
app.listen(5000, 
    () => {
    console.log("Server is running on port 5000");
});
