import { useMemo, useCallback } from "react";
import { CAT } from "../tokens";
import type { Trip, BudgetSummary } from "../types";

export default function useBudget(trip: Trip | undefined) {
  const budgetSummary: BudgetSummary = useMemo(() => {
    if (!trip) return { confirmedAmount: 0, estimatedAmount: 0, total: 0, perPerson: 0, categoryTotals: {}, donutData: [], settlement: [] };
    let confirmedAmount = 0;
    let estimatedAmount = 0;
    const categoryTotals: Record<string, number> = {};
    const paidByPerson: Record<number, number> = {};
    for (const expense of trip.expenses) {
      if (expense.ok) confirmedAmount += expense.amt;
      else estimatedAmount += expense.amt;
      categoryTotals[expense.cat] = (categoryTotals[expense.cat] || 0) + expense.amt;
      const who = expense.paidBy ?? 0;
      paidByPerson[who] = (paidByPerson[who] || 0) + expense.amt;
    }
    const total = confirmedAmount + estimatedAmount;
    const travelers = trip.travelers || 2;
    const perPerson = Math.round(total / travelers);
    const donutData = Object.entries(categoryTotals).map(([cat, value]) => ({
      color: CAT[cat]?.color || "#999",
      value,
      label: cat,
    }));
    const names = trip.travelerNames || [];
    const settlement = names.map((name, i) => ({
      name,
      paid: paidByPerson[i] || 0,
      shouldPay: perPerson,
      diff: (paidByPerson[i] || 0) - perPerson,
    }));
    return { confirmedAmount, estimatedAmount, total, perPerson, categoryTotals, donutData, settlement };
  }, [trip]);

  const exportCSV = useCallback(() => {
    if (!trip) return;
    const { total, perPerson } = budgetSummary;
    const rows: (string | number)[][] = [["\uCE74\uD14C\uACE0\uB9AC", "\uD56D\uBAA9", "\uC6D0", "\uC5D4", "\uD655\uC815"]];
    for (const e of trip.expenses) {
      rows.push([e.cat, e.name, e.amt, Math.round(e.amt / trip.rate), e.ok ? "Y" : "N"]);
    }
    rows.push([], ["", "\uD569\uACC4", total, Math.round(total / trip.rate)], ["", "1\uC778\uB2F9", perPerson, Math.round(perPerson / trip.rate)]);
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${trip.name}_\uACBD\uBE44.csv` }).click();
  }, [trip, budgetSummary]);

  return { budgetSummary, exportCSV };
}
