import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import aviproductRouter from './routes/aviproductRouter.js';
import aviuserRouter from './routes/aviuserRouter.js';
import jwt from 'jsonwebtoken';


const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

app.use((req,res,next)=>{
    const tokenString = req.header("Authorization")
    if(tokenString != null){
        const token = tokenString.replace("Bearer" ,"")
  

    jwt.verify(token, "cbc-ITP-project@2025" , 
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

mongoose.connect("mongodb+srv://admin:123@cluster0.oypseuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("Connect to the database")
}
).catch(()=>{
    console.log("Database connection failed")
})

app.use("/products" , aviproductRouter)
app.use("/users" , aviuserRouter)

// Start server
app.listen(5000, 
    () => {
    console.log("Server is running on port 5000");
});
