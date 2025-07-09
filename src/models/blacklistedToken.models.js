import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }, // Token expiry time
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);
