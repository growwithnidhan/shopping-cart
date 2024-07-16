const bcrypt = require("bcrypt");

// Define admin credentials
const adminCredentials = {
  email: "admin@gmail.com",
  password: "" // Will be replaced with hashed password
};

// Hash the admin password and store it in adminCredentials
bcrypt.hash("admin", 10).then((hash) => {
  adminCredentials.password = hash;
});

module.exports = {
  doLogin: (admindata) => {
    return new Promise((resolve, reject) => {
      let response = {};
      if (admindata.email === adminCredentials.email) {
      console.log()
        bcrypt.compare(admindata.password, adminCredentials.password).then((status) => {
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
};
