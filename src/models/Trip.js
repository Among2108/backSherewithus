import mongoose from "mongoose";

/**
 * TripMember (รองรับ Guest)
 */
const TripMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    _id: true, // ใช้ _id ของ member สำหรับอ้างอิงใน expense
  }
);

/**
 * Trip Schema
 */
const TripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    inviteCode: {
      type: String,
      unique: true,
      index: true,
    },

    // เจ้าของทริป (optional: ตอนนี้ยังเป็น guest-first)
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    members: {
      type: [TripMemberSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trip", TripSchema);
