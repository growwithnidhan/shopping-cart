const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
  doSignup: (userData) => {
    console.log(userData);
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      console.log(user);
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  addToCart: (proId, userId) => {
    let proObj = {
      item: ObjectId.createFromHexString(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId.createFromHexString(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex((product) => {
          if (product && product.item) {
            return product.item.equals(ObjectId.createFromHexString(proId));
          }
          console.warn("Undefined product or product.item:", product);
          return false;
        });
        console.log("Product exists at index:", proExist);
        if (proExist !== -1) {
          // Product already in cart, update quantity
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                user: ObjectId.createFromHexString(userId),
                "products.item": ObjectId.createFromHexString(proId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            );
          resolve();
        } else {
          // Product not in cart, add new product
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId.createFromHexString(userId) },
              {
                $push: { products: proObj },
              }
            );
          resolve();
        }
      } else {
        // Create new cart for user
        let cartObj = {
          user: ObjectId.createFromHexString(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId.createFromHexString(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(cartItems);
    });
  },
  getCartcount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId.createFromHexString(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: ObjectId.createFromHexString(details.cart) },
            {
              $pull: {
                products: {
                  item: ObjectId.createFromHexString(details.product),
                },
              },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId.createFromHexString(details.cart),
              "products.item": ObjectId.createFromHexString(details.product),
            },

            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  removeCartProduct: (items) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId.createFromHexString(items.cart) },
          {
            $pull: {
              products: {
                item: ObjectId.createFromHexString(items.product),
              },
            },
          }
        )
        .then((response) => {
          resolve({ remo: true });
        });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId.createFromHexString(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $addFields: {
              price: { $toDouble: "$product.Price" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$price"] } },
            },
          },
        ])
        .toArray();
        if (total && total.length > 0 && total[0].total !== undefined) {
          if (total[0].total === 0) {
            resolve('Cart is empty');
          } else {
            resolve(total[0].total);
          }
        } else {
          resolve('Cart is empty');
        }
      
      
    });
  },
        

  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, total);
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: ObjectId.createFromHexString(order.userId),
        paymentMethod: order["payment-method"],
        totalAmount: total,
        products,
        status,
        date: new Date(),
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: ObjectId.createFromHexString(order.userId) });
            resolve({status:true})
        });
    });
  },
  getCartList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId.createFromHexString(userId) });
      resolve(cart.products);
    });
  },
  getUserOrders:(userId) => {
    console.log("🚀 ~ userId:", userId)
    
    return new Promise(async(resolve,reject)=>{
      let order=await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId.createFromHexString(userId)}).toArray()
      resolve(order)
    })
    

  },
  getOrderProducts:(orderId)=>{
    console.log({orderId});
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id : ObjectId.createFromHexString(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
        console.log("ivde onnum kitunilla bro why?",orderItems)
        

      resolve(orderItems);
    });

  }

};
