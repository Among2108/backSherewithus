import express from "express";
import {
  createTrip,
  getTripById,
  addMemberToTrip,
  deleteMemberFromTrip,
  getAllTrips,
  deleteTrip
} from "../controllers/trip.controller.js";
import { getTripSummary } from "../controllers/summary.controller.js";

const router = express.Router();

router.post("/", createTrip); // POST /api/trips
router.get("/", getAllTrips);
router.get("/:id", getTripById); // GET /api/trips/:id
router.get("/:id/summary", getTripSummary);
router.post("/:id/members", addMemberToTrip); // POST /api/trips/:id/members
router.delete("/:id/members/:memberId", deleteMemberFromTrip);
router.delete("/:id", deleteTrip);

export default router;
