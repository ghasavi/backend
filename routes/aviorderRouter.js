import express from 'express';
import {createOrder} from "../controllers/aviordercontroller.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);

export default orderRouter;