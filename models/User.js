import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: String,
    userName: {
      type: String,
      unique: true,
    },
    TelegramID: {
      type: String,
      unique: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
