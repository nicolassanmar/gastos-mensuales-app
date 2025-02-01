import * as XLSX from "xlsx";
import { z } from "zod";

type XLSXCellObjectUndefined = XLSX.CellObject | undefined;

export const getCellValue = (
  sheet: XLSX.WorkSheet,
  cellAddress: XLSX.CellAddress | string,
) => {
  // Library does not properly type these objects
  if (typeof cellAddress === "string") {
    return (sheet[cellAddress] as XLSXCellObjectUndefined)?.v;
  }
  return (sheet[XLSX.utils.encode_cell(cellAddress)] as XLSXCellObjectUndefined)
    ?.v;
};

export const getCellValueAsStringOrThrow = (
  sheet: XLSX.WorkSheet,
  cellAddress: XLSX.CellAddress | string,
): string => {
  const value = getCellValue(sheet, cellAddress);
  if (value === undefined) {
    throw new Error(
      `Value at cell ${JSON.stringify(cellAddress)} is undefined`,
    );
  }
  return z.coerce.string().parse(value);
};
