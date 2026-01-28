import express from "express";
import {
  createExpense,
  getExpensesByTrip,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/:id/expenses", createExpense);
router.get("/:id/expenses", getExpensesByTrip);
router.patch("/:id/expenses/:expenseId", updateExpense);
router.delete("/:id/expenses/:expenseId", deleteExpense);

export default router;
