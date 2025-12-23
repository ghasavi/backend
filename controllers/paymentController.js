import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body; // amount in rupees

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Amount is required and must be a number" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert LKR to cents
      currency: "lkr",
      payment_method_types: ["card"],
    });

    res.status(200).json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
