const { ObjectId } = require("mongodb");
const collection = require("../config/collections");
const db = require("../config/connection");
const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_EajIQ7rZ7E7y6j",
  key_secret: "bNSdUB3yYpjlfam8w34TfdTb",
});

module.exports = {
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total*100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("new order:", order);
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "bNSdUB3yYpjlfam8w34TfdTb");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac === details["payment[razorpay_signature]"]) {
        resolve();
        console.log('success ayi order')
      } else {
        reject();
        console.log('reject ayi')
      }
    });
  },
  changepaymentStatus: (orderId) => {
    console.log('ithan order id',orderId)
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: ObjectId.createFromHexString(orderId) }
       ,{
        $set:{
            status:'placed'
        }
       }
     ).then(()=>{
        resolve()

     })
    });
  },
};
