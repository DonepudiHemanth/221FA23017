import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  shortcode: { type: String, unique: true, required: true },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  shortLink: { type: String },
  clicks: [
    {
      timestamp: { type: Date, default: Date.now },
      referrer: String,
      userAgent: String,
      ip: String,
      country: String,
      region: String,
      city: String,
    },
  ],
  totalClicks: { type: Number, default: 0 },
});

export default mongoose.model("Url", urlSchema);
