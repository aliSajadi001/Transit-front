// src/data/mockData.ts
// Mock data kept separate to keep the table component lean.

export type Status = "فعال" | "غیرفعال" | "در انتظار";
export type Vehicle = "سواری" | "کامیون" | "موتورسیکلت" | "اتوبوس" | "ون" | "تریلی";
export type TypeName = "حمل‌ونقل شهری" | "بین‌شهری" | "بین‌المللی" | "پیک";

export type DataRow = {
  id: number;
  type: TypeName;
  vehicle: Vehicle;
  date: string; // ISO string
  status: Status;
};

export const vehicles: Vehicle[] = [
  "سواری",
  "کامیون",
  "موتورسیکلت",
  "اتوبوس",
  "ون",
  "تریلی",
];

export const types: TypeName[] = ["حمل‌ونقل شهری", "بین‌شهری", "بین‌المللی", "پیک"];

export const statuses: Status[] = ["فعال", "غیرفعال", "در انتظار"];

function randomDateInLast90Days(): Date {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 90);
  const t = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(t);
}

export const makeData = (len: number): DataRow[] =>
  Array.from({ length: len }, (_, i) => {
    const d = randomDateInLast90Days();
    return {
      id: i + 1,
      type: types[i % types.length],
      vehicle: vehicles[i % vehicles.length],
      date: d.toISOString(),
      status: statuses[i % statuses.length],
    };
  });