import express from "express";
import cors from "cors";
import tripRoutes from "./routes/trip.routes.js";
import expenseRoutes from "./routes/expense.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "API running ✅" }));

app.use("/api/trips", tripRoutes);
app.use("/api/trips", expenseRoutes);
// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({
    success: false,
    message: err?.message || "Server error",
  });
});

export default app;
