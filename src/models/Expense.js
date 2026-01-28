import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      default: "Other",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    paidByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    splitAmongIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);
