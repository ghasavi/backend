import Order from "../models/aviorder.js";
import Product from "../models/aviproduct.js";
import { isAdmin } from "./aviuserController.js";

export async function createOrder(req, res) {
	if (req.user == null) {
		return res.status(403).json({
			message: "Please login and try again",
		});
	}

	const orderInfo = req.body;

	if (!orderInfo.name) {
		orderInfo.name = req.user.firstName + " " + req.user.lastName;
	}

	// Generate Order ID
	let orderId = "PXA00001";
	const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

	if (lastOrder.length > 0) {
		const lastOrderNumber = parseInt(lastOrder[0].orderId.replace("PXA", ""));
		orderId = "PXA" + String(lastOrderNumber + 1).padStart(5, "0");
	}

	try {
		let total = 0;
		let labelledTotal = 0;
		const products = [];

		for (let i = 0; i < orderInfo.products.length; i++) {
			const cartItem = orderInfo.products[i];

			const item = await Product.findOne({
				productId: cartItem.productId,
			});

			if (!item) {
				return res.status(404).json({
					message: `Product ${cartItem.productId} not found`,
				});
			}

			if (!item.isAvailable) {
				return res.status(400).json({
					message: `${item.name} is not available right now`,
				});
			}

			// 🚨 STOCK CHECK
			if (item.stock < cartItem.qty) {
				return res.status(400).json({
					message: `Only ${item.stock} left for ${item.name}`,
				});
			}

			// 🔥 REDUCE STOCK
			item.stock -= cartItem.qty;

			if (item.stock === 0) {
				item.isAvailable = false;
			}

			await item.save();

			// Snapshot product info
			products.push({
				productInfo: {
					productId: item.productId,
					name: item.name,
					altNames: item.altNames,
					description: item.description,
					images: item.images,
					labelledPrice: item.labelledPrice,
					price: item.price,
				},
				quantity: cartItem.qty,
			});

			total += item.price * cartItem.qty;
			labelledTotal += item.labelledPrice * cartItem.qty;
		}

		const order = new Order({
			orderId,
			email: req.user.email,
			name: orderInfo.name,
			address: orderInfo.address,
			phone: orderInfo.phone,
			products,
			labelledTotal,
			total,
			status: "paid",
		});

		const createdOrder = await order.save();

		res.json({
			message: "Order created successfully & stock updated",
			order: createdOrder,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Failed to create order",
			error: err,
		});
	}
}

export async function getOrders(req, res) {
	if (req.user == null) {
		res.status(403).json({
			message: "Please login and try again",
		});
		return;
	}
	try {
		if (req.user.role == "admin") {
            const orders = await Order.find();
            res.json(orders);
		}else{
            const orders = await Order.find({ email: req.user.email });
            res.json(orders);
        }
	} catch (err) {
		res.status(500).json({
			message: "Failed to fetch orders",
			error: err,
		});
	}
}

export async function updateOrderStatus(req,res){
	if (!isAdmin(req)) {
		res.status(403).json({
			message: "You are not authorized to update order status",
		});
		return;
	}
	try{
		const orderId = req.params.orderId;
		const status = req.params.status;

		await Order.updateOne(
			{
				orderId: orderId
			},
			{
				status : status
			}
		)

		res.json({
			message: "Order status updated successfully",
		});

	}catch(e){
		res.status(500).json({
			message: "Failed to update order status",
			error: e,
		});
		return;
	}

	

	
	
}

export async function deleteOrder(req, res) {
	if (!isAdmin(req)) {
		res.status(403).json({
			message: "You are not authorized to delete orders",
		});
		return;
	}

	try {
		const orderId = req.params.orderId;

		const deletedOrder = await Order.findOneAndDelete({
			orderId: orderId,
		});

		if (!deletedOrder) {
			return res.status(404).json({
				message: "Order not found",
			});
		}

		res.json({
			message: "Order deleted successfully",
		});
	} catch (e) {
		res.status(500).json({
			message: "Failed to delete order",
			error: e,
		});
	}
}
