export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function buildSummary({ members = [], expenses = [] }) {
  const memberIds = members.map((m) => String(m._id));

  // init maps
  const paidMap = Object.fromEntries(memberIds.map((id) => [id, 0]));
  const shareMap = Object.fromEntries(memberIds.map((id) => [id, 0]));

  let total = 0;

  for (const e of expenses) {
    const amount = round2(e.amount || 0);
    if (amount <= 0) continue;

    total = round2(total + amount);

    const payerId = String(e.paidByMemberId || "");
    if (paidMap[payerId] !== undefined) {
      paidMap[payerId] = round2(paidMap[payerId] + amount);
    }

    const splitIds = Array.isArray(e.splitAmongIds)
      ? e.splitAmongIds.map((x) => String(x))
      : [];

    const validSplit = splitIds.filter((id) => shareMap[id] !== undefined);
    if (validSplit.length === 0) continue;

    const each = round2(amount / validSplit.length);

    // แจก share ให้ทุกคนใน split
    for (const id of validSplit) {
      shareMap[id] = round2(shareMap[id] + each);
    }
  }

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

  const settlements = computeSettlements(perPerson);

  return {
    total: round2(total),
    perPerson,
    settlements,
  };
}

export function computeSettlements(perPerson) {
  // creditors: net > 0, debtors: net < 0
  const creditors = perPerson
    .filter((p) => p.net > 0.01)
    .map((p) => ({ memberId: p.memberId, amount: round2(p.net) }));

  const debtors = perPerson
    .filter((p) => p.net < -0.01)
    .map((p) => ({ memberId: p.memberId, amount: round2(-p.net) })); // เป็นยอดที่ต้องจ่าย

  const result = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];

    const pay = round2(Math.min(d.amount, c.amount));
    if (pay > 0) {
      result.push({
        from: d.memberId,
        to: c.memberId,
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
