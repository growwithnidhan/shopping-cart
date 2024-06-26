var db=require('../config/connection')
var collection=require('../config/collections')
const { ObjectId } = require('mongodb'); // Ensure this is only declared once

const { log } = require('handlebars');

module.exports={
        addProduct:(product,callback)=>{
         
         
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data.insertedId);
            callback(data.insertedId)

        }).catch((err)=>{
            console.log(err);
        })
    },
    getAllProducts:()=>{
        return  new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId.createFromHexString(prodId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: ObjectId.createFromHexString(prodId) }).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(prodId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: ObjectId.createFromHexString(prodId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
}