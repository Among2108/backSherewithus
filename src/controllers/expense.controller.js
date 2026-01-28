import Expense from "../models/Expense.js";
import Trip from "../models/Trip.js";

// 1️⃣ POST /api/trips/:id/expenses
export const createExpense = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const { title, amount, category, paidByMemberId, splitAmongIds, date } =
      req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "title is required" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be > 0" });
    }
    if (!paidByMemberId) {
      return res.status(400).json({ success: false, message: "payer is required" });
    }
    if (!Array.isArray(splitAmongIds) || splitAmongIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "split members required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "trip not found" });
    }

    const expense = await Expense.create({
      tripId,
      title: title.trim(),
      amount,
      category,
      paidByMemberId,
      splitAmongIds,
      date: date || new Date(),
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    return next(err);
  }
};

// 2️⃣ GET /api/trips/:id/expenses
export const getExpensesByTrip = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;

    const expenses = await Expense.find({ tripId }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    return next(err);
  }
};

// 3️⃣ PATCH /api/trips/:id/expenses/:expenseId
export const updateExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: "expense not found" });
    }

    return res.status(200).json({ success: true, data: expense });
  } catch (err) {
    return next(err);
  }
};

// 4️⃣ DELETE /api/trips/:id/expenses/:expenseId
export const deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, message: "expense not found" });
    }

    return res.status(200).json({
      success: true,
      data: { removedExpenseId: expenseId },
    });
  } catch (err) {
    return next(err);
  }
};
