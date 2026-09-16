import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
    name: string;
    desciption?: string;
    image: string;
    ownerId: string;
    phone: number;
    isVerified: boolean;

    autoLocation: {
        type: "Point",
        coordinates: [number, number]; //[longtitude, latitude]
        formattedAddress: string;
    };

    isOpen: boolean;
    createdAt: Date;
}

const schema = new Schema<IRestaurant>({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    desciption: String,
    image: {
        type: String,
        required: true,
    },

    ownerId: {
        type: String,
        required: true,
    },

    phone: {
        type: Number,
        required: true,
    },

    isVerified: {
        type: Boolean,
        required: true,
    },

    autoLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true
        },
        formattedAddress: {
            type: String
        }
    },

    isOpen: {
        type: Boolean,
        default: false
    },


},
    {
        timestamps: true,
    }
);

schema.index({ autoLocation: "2dsphere" });

export default mongoose.model<IRestaurant>("Restaurant", schema);