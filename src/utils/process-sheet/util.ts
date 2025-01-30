import { ExpenseRecord } from "@prisma/client";
import * as XLSX from "xlsx";
import { Bank, SheetExpenseRecord } from "../types";
import { string } from "zod";

export type HeaderCells = {
  debitCell: XLSX.CellAddress;
  creditCell: XLSX.CellAddress;
  dateCell: XLSX.CellAddress;
  conceptCell: XLSX.CellAddress;
};
export const compareEqualRecords = (
  a: SheetExpenseRecord,
  b: SheetExpenseRecord,
) => {
  return (
    a.amount === b.amount &&
    a.bank === b.bank &&
    a.concept === b.concept &&
    a.date.getTime() === b.date.getTime()
  );
};

const startsWithOne = (string: string, prefixes: string[]): boolean => {
  return prefixes.some((prefix) => string.startsWith(prefix));
};

const parseType = (
  _concept: string,
  bank: SheetExpenseRecord["bank"],
): SheetExpenseRecord["type"] => {
  const concept = _concept.toLowerCase();
  switch (bank) {
    case "ITAU":
      if (startsWithOne(concept, ["compra", "rediva"])) return "compra";
      if (
        concept.startsWith("traspaso") ||
        startsWithOne(concept, ["cre. cambio", "deb. cambio"])
      )
        return "transferencia";

      if (
        startsWithOne(concept, ["deb. varios", "cre. varios", "cre.varios"])
      ) {
        return "inversion";
      }
      break;
    case "SCOTIABANK":
      if (
        startsWithOne(concept, ["com giro", "giro rec"]) ||
        concept.includes("/trn/")
      )
        return "transferencia";
      if (concept.startsWith("CAMBIO MONEDA")) return "cambio-moneda";
      break;
    case "SANTANDER":
      // pago caja profesionales
      if (concept.includes("cjppu")) return "compra";
      if (
        startsWithOne(concept, [
          "debito operacion en supernet o sms",
          "credito por operacion",
        ])
      )
        return "transferencia";
      // TODO: Cómo es cambiar?
      break;
  }
  return "compra";
};

const removeCompraRedivaPrefix = (
  concept: string,
): {
  conceptWithoutPrefix: string;
  prefix: string;
} => {
  const prefixes = [/compra ( )*/i, /rediva 19210( )*/i, /rediva 17934( )*/i];
  const prefix = (() => {
    for (const prefix of prefixes) {
      if (concept.match(prefix)) {
        return concept.match(prefix)![0];
      }
    }
    return "";
  })();
  if (!prefix) return { conceptWithoutPrefix: concept, prefix };
  return {
    conceptWithoutPrefix: concept.replace(prefix, "").trim(),
    prefix,
  };
};

export const processSheet = (
  sheet: XLSX.WorkSheet,
  bank: Bank,
  currency: SheetExpenseRecord["currency"],
  cells: HeaderCells,
): SheetExpenseRecord[] => {
  const range = XLSX.utils.decode_range(sheet["!ref"]!);

  const rowRange: number[] = Array.from(
    { length: range.e.r - cells.debitCell.r + 1 },
    (_, i) => cells.debitCell.r + 1 + i,
  );

  const records = rowRange
    .map((row) => {
      const debitValue = -Math.abs(
        Number.parseFloat(
          sheet[XLSX.utils.encode_cell({ r: row, c: cells.debitCell.c })]?.v,
        ),
      );
      const creditValue = Math.abs(
        Number.parseFloat(
          sheet[XLSX.utils.encode_cell({ r: row, c: cells.creditCell.c })]?.v,
        ),
      );
      const dateString: string =
        sheet[XLSX.utils.encode_cell({ r: row, c: cells.dateCell.c })]?.v;
      const concept = sheet[
        XLSX.utils.encode_cell({ r: row, c: cells.conceptCell.c })
      ]?.v as string;

      console.log({ row, debitValue, creditValue, dateString, concept });

      if (!dateString) return;

      const [day, month, year] = dateString.split("/").map(Number) as [
        number,
        number,
        number,
      ];
      const date = new Date(year, month - 1, day);
      const amount = (() => {
        if (!Number.isNaN(debitValue) && Number(debitValue) !== 0) {
          return debitValue;
        }
        if (!Number.isNaN(creditValue) && Number(creditValue) !== 0) {
          return creditValue;
        }
        return undefined;
      })();

      if (!amount) return;

      const { conceptWithoutPrefix, prefix } =
        removeCompraRedivaPrefix(concept);

      return {
        date,
        concept,
        amount,
        bank,
        currency,
        type: parseType(concept, bank),
        conceptWithoutPrefix,
        prefix,
      };
    })
    .filter(Boolean);

  return records;
};
