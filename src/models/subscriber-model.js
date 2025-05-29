import { Schema, model } from "mongoose";

const subscriberSchema = new Schema(
    {
      email: { type: String, required: true, unique: true },

    },
    { timestamps: true }
  );
  
const Subscriber = model("Subscriber", subscriberSchema);

export default Subscriber;