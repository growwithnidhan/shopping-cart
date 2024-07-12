
const Razorpay = require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_EajIQ7rZ7E7y6j',
  key_secret: 'bNSdUB3yYpjlfam8w34TfdTb',
});



module.exports={
generateRazorpay:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
       var options={
        amount:total,
        currency:"INR",
        receipt: ''+orderId
             };
       instance.orders.create(options,function(err,order){
        if(err){
          console.log(err)
        }else{
        console.log("new order:",order);
        resolve(order)
        }
       })
      

    })
  },
  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
        const crypto = require('crypto');
        const hmac= crypto.createHmac('sha256','bNSdUB3yYpjlfam8w34TfdTb')

    })


  }
};
