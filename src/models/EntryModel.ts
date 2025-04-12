import mongoose from "mongoose";
import bcrypt from "bcrypt";

const entrySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPrivate: { type: Boolean, default: true },
    originalContent: { type: String, required: true }, // Store original content temporarily
  },
  { timestamps: true }
);

// Hash content before saving
entrySchema.pre("save", async function (next) {
  if (!this.isModified("content")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.content = await bcrypt.hash(this.content, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add an index to optimize queries by user
entrySchema.index({ user: 1 });

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;
