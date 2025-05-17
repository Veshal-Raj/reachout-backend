import { Schema, model } from "mongoose";

const templateSchema = new Schema(
    {
      templateName: { type: String, required: true, unique: true },
      subject: { type: String, required: true },
      body: { type: String, required: true },
      attachments: {
          url: { type: String },
          name: { type: String },
          size: { type: Number }
        },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
  );
  
  const Template = model("Template", templateSchema);
  
  export default Template;