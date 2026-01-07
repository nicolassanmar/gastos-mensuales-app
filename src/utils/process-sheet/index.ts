import { type Bank, type SheetExpenseRecord } from "~/utils/types";
import * as XLSX from "xlsx";
import { processSheet } from "./util";
import { getCellValueAsString } from "./xlsx-util";

export const processItau = (sheet: XLSX.WorkSheet): SheetExpenseRecord[] => {
  const bank = "ITAU";
  const debitCell = XLSX.utils.decode_cell("E7");
  const creditCell = XLSX.utils.decode_cell("F7");
  const dateCell = XLSX.utils.decode_cell("B7");
  const conceptCell = XLSX.utils.decode_cell("C7");

  // library does not properly type this
  const currency =
    getCellValueAsString(sheet, "F5") === "Dólares" ? "USD" : "UYU";

  return processSheet(sheet, bank, currency, {
    debitCell,
    creditCell,
    dateCell,
    conceptCell,
  });
};

export const processScotiabank = (
  sheet: XLSX.WorkSheet,
  fileName: string,
): SheetExpenseRecord[] => {
  const bank = "SCOTIABANK";
  const debitCell = XLSX.utils.decode_cell("F3");
  const creditCell = XLSX.utils.decode_cell("G3");
  const dateCell = XLSX.utils.decode_cell("B3");
  const conceptCell = XLSX.utils.decode_cell("D3");

  /** Scotiabank excel files do not have any indication of the currency */
  const currency = fileName.toLowerCase().includes("usd") ? "USD" : "UYU";
  return processSheet(sheet, bank, currency, {
    debitCell,
    creditCell,
    dateCell,
    conceptCell,
  });
};

export const processSantander = (
  sheet: XLSX.WorkSheet,
): SheetExpenseRecord[] => {
  const bank = "SANTANDER";
  const debitCell = XLSX.utils.decode_cell("G15");
  const creditCell = XLSX.utils.decode_cell("I15");
  const dateCell = XLSX.utils.decode_cell("B15");
  const conceptCell = XLSX.utils.decode_cell("D15");

  const currency = getCellValueAsString(sheet, "E10") === "UYU" ? "UYU" : "USD";

  return processSheet(sheet, bank, currency, {
    debitCell,
    creditCell,
    dateCell,
    conceptCell,
  });
};

const discriminateBank = (sheetName: string): Bank => {
  switch (sheetName) {
    case "Estado de Cuenta":
      return "ITAU";
    case "Hoja1":
      return "SCOTIABANK";
    case "AccountMovementsExtended":
      return "SANTANDER";
    default:
      throw new Error("Unknown bank");
  }
};

export const mkExpenseRecords = (buffer: ArrayBuffer, fileName: string) => {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0]!;
  const bank = discriminateBank(sheetName);
  console.log("🚀 ~ file: index.ts:81 ~ mkExpenseRecords ~ bank:", bank);
  const sheet = workbook.Sheets[sheetName]!;
  if (bank === "ITAU") {
    return processItau(sheet);
  }
  if (bank === "SCOTIABANK") {
    return processScotiabank(sheet, fileName);
  }
  if (bank === "SANTANDER") {
    return processSantander(sheet);
  }
  throw new Error("this should be a switch case");
};
