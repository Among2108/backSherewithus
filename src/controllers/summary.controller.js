import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import { buildSummary } from "../service/settlement.service.js";

// GET /api/trips/:id/summary
export const getTripSummary = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "trip not found" });
    }

    const expenses = await Expense.find({ tripId }).sort({ date: -1 });

    const summary = buildSummary({
      members: trip.members,
      expenses,
    });

    return res.status(200).json({
      success: true,
      data: {
        tripId: trip._id,
        title: trip.title,
        total: summary.total,
        perPerson: summary.perPerson,
        settlements: summary.settlements,
      },
    });
  } catch (err) {
    return next(err);
  }
};
