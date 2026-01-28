// ปัดเลขทศนิยม 2 ตำแหน่ง (กัน floating error)
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * buildSummary
 * @param {Object} params
 * @param {Array} params.members  [{ _id, name }]
 * @param {Array} params.expenses [{ amount, paidByMemberId, splitAmongIds }]
 */
export function buildSummary({ members = [], expenses = [] }) {
  // map member ids เป็น string
  const memberIds = members.map((m) => String(m._id));

  // init paid / share map
  const paidMap = Object.fromEntries(memberIds.map((id) => [id, 0]));
  const shareMap = Object.fromEntries(memberIds.map((id) => [id, 0]));

  let total = 0;

  // ===== loop expenses =====
  for (const e of expenses) {
    const amount = round2(e.amount || 0);
    if (amount <= 0) continue;

    total = round2(total + amount);

    // ---- paid ----
    const payerId = String(e.paidByMemberId || "");
    if (paidMap[payerId] !== undefined) {
      paidMap[payerId] = round2(paidMap[payerId] + amount);
    }

    // ---- split ----
    const splitIds = Array.isArray(e.splitAmongIds)
      ? e.splitAmongIds.map((x) => String(x))
      : [];

    const validSplit = splitIds.filter((id) => shareMap[id] !== undefined);
    if (validSplit.length === 0) continue;

    const each = round2(amount / validSplit.length);

    for (const id of validSplit) {
      shareMap[id] = round2(shareMap[id] + each);
    }
  }

  // ===== per person summary =====
  const perPerson = members.map((m) => {
    const id = String(m._id);
    const paid = round2(paidMap[id] || 0);
    const share = round2(shareMap[id] || 0);
    const net = round2(paid - share);

    return {
      memberId: id,
      name: m.name,
      paid,
      share,
      net,
    };
  });

  // ===== settlement =====
  const settlements = computeSettlements(perPerson);

  return {
    total: round2(total),
    perPerson,
    settlements,
  };
}

/**
 * computeSettlements
 * แปลง net (+/-) → ใครต้องจ่ายใคร
 */
export function computeSettlements(perPerson = []) {
  // คนที่ต้อง "รับเงิน"
  const creditors = perPerson
    .filter((p) => p.net > 0.01)
    .map((p) => ({
      memberId: p.memberId,
      name: p.name,
      amount: round2(p.net),
    }));

  // คนที่ต้อง "จ่ายเงิน"
  const debtors = perPerson
    .filter((p) => p.net < -0.01)
    .map((p) => ({
      memberId: p.memberId,
      name: p.name,
      amount: round2(-p.net),
    }));

  const result = [];
  let i = 0;
  let j = 0;

  // greedy settlement
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];

    const pay = round2(Math.min(d.amount, c.amount));
    if (pay > 0) {
      result.push({
        fromId: d.memberId,
        fromName: d.name,
        toId: c.memberId,
        toName: c.name,
        amount: pay,
      });
    }

    d.amount = round2(d.amount - pay);
    c.amount = round2(c.amount - pay);

    if (d.amount <= 0.01) i++;
    if (c.amount <= 0.01) j++;
  }

  return result;
}
