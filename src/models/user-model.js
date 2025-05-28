import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      metaData: {
        senderEmail: { type: String, default: "" },
        senderEmailPassword: { type: String, default: "" }
      },
      verified: { type: Boolean, default: false },
      refreshToken: { type: String, required: false},
      createdAt: {
        type: Date,
        default: Date.now
      },
      lastLogin: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
  );
  
const User = model("User", userSchema);

export default User;