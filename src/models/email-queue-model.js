import { Schema, model } from "mongoose";

const emailQueueSchema = new Schema(
    {
      listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
      templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },
      status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
      sentAt: { type: Date },
      failedReason: { type: String },
    },
    { timestamps: true }
  );
  
const EmailQueue = model("EmailQueue", emailQueueSchema);

export default EmailQueue;