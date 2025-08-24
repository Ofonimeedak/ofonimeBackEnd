const axios = require("axios");
const crypto = require("crypto");
require('dotenv').config()




//initialize payment with metadata
exports.initializePayment = async (req, res) => {
  const { email, amount, orderId, userId, cartItems } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack expects kobo
        metadata: {
          orderId,
          userId,
          cartItems,    // array of items like [{ productId: 55hud55363, quantity: 3 }]
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data); // Send the authorization_url to frontend
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};



// Webhook endpoint (Paystack will notify you here)
exports.getWebhookUpdate = (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  // Validate event signature
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
  const paymentData = event.data;

  const { orderId, userId, cartItems } = paymentData.metadata;

  console.log("Metadata from webhook:", orderId, userId, cartItems);

  //update your DB, send email, notifications, etc.
}


  res.sendStatus(200);
};



// Verify payment manually from the frontend after redirect
exports.verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
};