import mongoose, { Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const cartsCollection = 'carts';

const CartsSchema = new Schema({
    products: {
        type: [{
            quantity: {
                type: Number,
                default: 0
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            }
        }],
        default: []
    },
})

CartsSchema.plugin(mongoosePaginate);

export const CartsModel = mongoose.model(cartsCollection, CartsSchema);