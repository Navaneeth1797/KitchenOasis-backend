import AsyncError from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/order.js";
import Products from "../models/products.js";

// create new order => /api/orders/new
export let newOrder = AsyncError(async (req, res, next) => {
  let {
    orderItems,
    shippingInfos,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethods,
    paymentInfo,
  } = req.body;
  let order = await Order.create({
    orderItems,
    shippingInfos,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethods,
    paymentInfo,
    user: req.user._id,
  });
  res.status(200).json({
    order,
  });
});
// get current user order details  => /api/me/orders
export let myOrders = AsyncError(async (req, res, next) => {
  let order = await Order.find({ user: req.user._id });

  res.status(200).json({
    order,
  });
});
// get order details by id => /api/order/:id
export let getOrderDetailsById = AsyncError(async (req, res, next) => {
  let order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("no order found with this id", 404));
  }
  res.status(200).json({
    order,
  });
});
// get all orders details-admin  => /api/admin/orders
export let allOrders = AsyncError(async (req, res, next) => {
  let order = await Order.find({ user: req.user._id });

  res.status(200).json({
    order,
  });
});
// update order details by id-admin => /api/order/:id
export let updateOrderDetailsById = AsyncError(async (req, res, next) => {
  let order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("no order found with this id", 404));
  }
  if (order?.orderStatus === "Delivered") {
    return next(new ErrorHandler("this order has been deleivered alredy", 400));
  }

  const allowedStatuses = [
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];
  if (!allowedStatuses.includes(req.body.status)) {
    return next(new ErrorHandler("Invalid order status provided", 400));
  }

  let productNotFound = false;

  //update products stock
  for (let items of order.orderItems) {
    let product = await Products.findById(items?.product?.toString());
    if (!product) {
      productNotFound = true;
      break;
    }
    product.stock = product.stock - items.quantity;
    await product.save({ validateBeforeSave: false });
  }
  if (productNotFound) {
    return next(new ErrorHandler("no product found with this id", 404));
  }
  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
    order.estimatedDeliveryDate = undefined;
  }
  if (req.body.trackingNumber) {
    order.trackingNumber = req.body.trackingNumber;
  }
  // Calculate and update estimated delivery date (ETA) when order is shipped
  if (req.body.status === "Shipped") {
    const deliveryDays = 3; // Example: Estimated delivery in 3 days
    const deliveryDate = new Date(
      Date.now() + deliveryDays * 24 * 60 * 60 * 1000
    );
    order.estimatedDeliveryDate = deliveryDate;
  }

  await order.save();
  res.status(200).json({
    success: true,
  });
});
async function getSalesData(startDate, endDate) {
  let salesData = await Order.aggregate([
    {
      //stage 1 -filter reults
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      //stage 2 -filter reults
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalSales: { $sum: "$totalAmount" },
        numOrders: { $sum: 1 },
      },
    },
  ]);
  // create a map to store sales data and num of order by data
  let salesMap = new Map();
  let totalSales = 0;
  let totalNumOrders = 0;
  salesData.forEach((entry) => {
    let date = entry?._id.date;
    let sales = entry?.totalSales;
    let numOrders = entry?.numOrders;
    salesMap.set(date, { sales, numOrders });
    totalSales += sales;
    totalNumOrders += numOrders;
  });
  //genertae an array of dates betwwen start and end date
  let dateBetween = getDatesBetween(startDate, endDate);
  //create final sales data array with 0 for dates without sales
  let finalSalesData = dateBetween.map((date) => ({
    date,
    sales: (salesMap.get(date) || { sales: 0 }).sales,
    numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
  }));
  return { salesData: finalSalesData, totalSales, totalNumOrders };
}
function getDatesBetween(startDate, endDate) {
  let dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    let formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
// get sales data  => /api/admin/get_data
export let getSales = AsyncError(async (req, res, next) => {
  let startDate = new Date(req.query.startDate);
  let endDate = new Date(req.query.endDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  let { salesData, totalSales, totalNumOrders } = await getSalesData(
    startDate,
    endDate
  );

  res.status(200).json({
    totalSales,
    totalNumOrders,
    sales: salesData,
  });
});
// delete order details by id => /api/admin/orders/:id
export let deleteOrderById = AsyncError(async (req, res, next) => {
  let order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("no order found with this id", 404));
  }
  await order.deleteOne();
  res.status(200).json({
    sucess: true,
  });
});
