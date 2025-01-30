import * as XLSX from "xlsx";

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
