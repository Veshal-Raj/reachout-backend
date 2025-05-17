import { Schema, model } from "mongoose";

const listSchema = new Schema(
  {
    name: { type: String, required: true },
    recipients: [
      {
        receiverEmail: { type: String, required: true, unique: false },
        receiverName: { type: String },
        receiverCompany: { type: String },
        receiverDesignation: { type: String },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const List = model('List', listSchema);

export default List;