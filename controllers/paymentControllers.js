import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Stripe from "stripe";
import Order from "../models/order.js";

let stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// create stripe checout s => /api/payment/checkout_session
export let stripeCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  let body = req?.body;
  let line_items = body?.orderItems?.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          images: [item?.image],
          metadata: { productId: item?.product },
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.quantity,
      tax_rates: ["txr_1OrOUmSHvwjNZqw3VyG3RoI2"],
    };
  });
  let shippingInfos = body?.shippingInfos;

  let shipping_rate =
    body?.itemsPrice >= 200
      ? "shr_1OrNSzSHvwjNZqw3B8GDaxC3"
      : "shr_1OrNUNSHvwjNZqw3UHstOX8i";
  let session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
    cancel_url: `${process.env.FRONTEND_URL}`,
    customer_email: req?.user?.email,
    client_reference_id: req?.user?._id?.toString(),
    mode: "payment",
    metadata: { ...shippingInfos, itemsPrice: body?.itemsPrice },
    shipping_options: [
      {
        shipping_rate,
      },
    ],
    line_items,
  });
  console.log(session);
  res.status(200).json({
    url: session.url,
  });
});
let getOrderItems = async (line_items) => {
  return new Promise((resolve, reject) => {
    let cartItems = [];
    line_items?.data?.forEach(async (item) => {
      let product = await stripe.products.retrieve(item.price.product);
      let productId = product.metadata.productId;

      cartItems.push({
        product: productId,
        name: product.name,
        price: item.price.unit_amount_decimal / 100,
        quantity: item?.quantity,
        image: product.images[0],
      });
      if (cartItems.length === line_items?.data?.length) {
        resolve(cartItems);
      }
    });
  });
};

// create new order after payment => /api/payment/webhook
export let stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  try {
    let signature = req.headers["stripe-signature"];
    let event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    if (event.type === "checkout.session.completed") {
      let session = event.data.object;
      let lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      let orderItems = await getOrderItems(lineItems);
      let user = session.client_reference_id;
      let totalAmount = session.amount_total / 100;
      let taxAmount = session.total_details.amount_tax / 100;
      let shippingAmount = session.total_details.amount_shipping / 100;
      let itemsPrice = session.metadata.itemsPrice;

      let shippingInfos = {
        address: session.metadata.address,
        city: session.metadata.city,
        phoneNo: session.metadata.phoneNo,
        zipCode: session.metadata.zipCode,
        country: session.metadata.country,
      };
      let paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
      };
      let orderData = {
        shippingInfos,
        orderItems,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentInfo,
        paymentMethods: "CARD",
        user,
      };
      await Order.create(orderData);

      res.status(200).json({
        success: true,
      });
    }
  } catch (error) {
    console.log("error =>", error);
  }
});
