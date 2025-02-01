import * as XLSX from "xlsx";
import { z } from "zod";

type XLSXCellObjectUndefined = XLSX.CellObject | undefined;

const getCellValue = (
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

export const getCellValueAsString = (
  sheet: XLSX.WorkSheet,
  cellAddress: XLSX.CellAddress | string,
): string => {
  const value = getCellValue(sheet, cellAddress);
  return z.coerce.string().parse(value);
};
