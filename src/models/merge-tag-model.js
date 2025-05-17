import { Schema, model } from "mongoose";

const mergeTagSchema = new Schema(
    {
      name: { type: String, required: true, unique: true },
      description: { type: String },
      exampleValue: { type: String },
    },
    { timestamps: true }
  );
  
  
const MergeTag = model("MergeTag", mergeTagSchema);

export default MergeTag;