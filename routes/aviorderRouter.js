import express from "express";
import { createOrder, getOrders, updateOrderStatus,deleteOrder } from "../controllers/aviordercontroller.js";
const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/",getOrders)
orderRouter.put("/:orderId/:status",updateOrderStatus)
orderRouter.delete("/:orderId", deleteOrder); 


export default orderRouter;