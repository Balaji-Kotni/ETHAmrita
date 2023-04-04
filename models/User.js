import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: String,
    userName: {
      type: String,
      unique: true,
      default: null,
    },
    TelegramID: {
      type: String,
      unique: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    claims: {
      type: Array,
      default: [],
    },
    githubProfile: {
      type: Object,
      default: {},
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
