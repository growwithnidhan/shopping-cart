const db = require("../config/connection");
const bcrypt = require("bcrypt");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");

// Define admin credentials
const adminCredentials = {
  email: "admin@gmail.com",
  password: "",
};

bcrypt.hash("admin", 10).then((hash) => {
  adminCredentials.password = hash;
});

module.exports = {
  doLogin: (admindata) => {
    return new Promise((resolve, reject) => {
      let response = {};
      if (admindata.email === adminCredentials.email) {
        console.log();
        bcrypt
          .compare(admindata.password, adminCredentials.password)
          .then((status) => {
            if (status) {
              console.log("admin login successful");
              response.admin = adminCredentials;
              response.status = true;
              resolve(response);
            } else {
              console.log("admin login failed");
              response.status = false;
              resolve(response);
            }
          });
      } else {
        console.log("ithil admin login failed");
        response.status = false;
        resolve(response);
      }
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await db.get()
          .collection(collections.ORDER_COLLECTION)
          .find()
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
};
