import Expense from "../models/Expense.js"; //
import Trip from "../models/Trip.js";

// สร้าง invite code
function genInviteCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// 1️⃣ POST /api/trips
export const createTrip = async (req, res, next) => {
  try {
    const { title, coverImage } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    let inviteCode = genInviteCode();
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await Trip.findOne({ inviteCode });
      if (!exists) break;
      inviteCode = genInviteCode();
    }

    const trip = await Trip.create({
      title: title.trim(),
      coverImage: coverImage || "",
      inviteCode,
      members: [],
    });

    return res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/trips
export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find()
      .sort({ createdAt: -1 }); // ใหม่สุดขึ้นก่อน

    return res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (err) {
    return next(err);
  }
};

// 2️⃣ GET /api/trips/:id
export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    return next(err);
  }
};

// 3️⃣ POST /api/trips/:id/members
export const addMemberToTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "member name is required",
      });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "trip not found",
      });
    }

    const exists = trip.members.some(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "member name already exists",
      });
    }

    trip.members.push({ name: name.trim() });
    await trip.save();

    const added = trip.members[trip.members.length - 1];

    return res.status(201).json({
      success: true,
      data: {
        tripId: trip._id,
        member: added,
        members: trip.members,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteMemberFromTrip = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "trip not found",
      });
    }

    const member = trip.members.id(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "member not found",
      });
    }

    // 🔒 กันลบ ถ้า member ถูกใช้ใน expense
    const usedInExpense = await Expense.findOne({
      tripId: id,
      $or: [
        { paidByMemberId: memberId },
        { splitAmongIds: memberId },
      ],
    });

    if (usedInExpense) {
      return res.status(409).json({
        success: false,
        message: "cannot delete member with existing expenses",
      });
    }

    // ลบ member
    member.deleteOne();
    await trip.save();

    return res.status(200).json({
      success: true,
      data: {
        tripId: trip._id,
        removedMemberId: memberId,
        members: trip.members,
      },
    });
  } catch (err) {
    return next(err);
  }
};