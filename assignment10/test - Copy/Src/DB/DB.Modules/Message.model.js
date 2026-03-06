import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
  {
    Contact: { type: String, required: true },
    Sender: { type: mongoose.Types.ObjectId, ref: "User" },
    Receiver: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps },
);
const MessageModel = mongoose.model("Note", MessageSchema);
export default MessageModel;
