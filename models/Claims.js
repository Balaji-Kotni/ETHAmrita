import mongoose from "mongoose";

const claimSchema = mongoose.Schema({
  callbackId: {
    type: String,
    unique: true,
  },
  templateId: {
    type: String,
    unique: true,
  },
  telegramID: {
    type: String,
  },
  claim: {
    type: Object,
    required: true,
    default: {},
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  repo: {
    type: Object,
    default: {},
    required: true,
  },
});

export default mongoose.model("Claim", claimSchema);
