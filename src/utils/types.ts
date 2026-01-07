export type Bank = "ITAU" | "SCOTIABANK" | "SANTANDER";

export type SheetExpenseRecord = {
  id?: string;
  date: Date;
  amount: number;
  concept: string;
  bank: Bank;
  currency: "USD" | "UYU";
  type: "compra" | "transferencia" | "cambio-moneda" | "inversion";
  conceptWithoutPrefix: string;
  prefix: string;
};
