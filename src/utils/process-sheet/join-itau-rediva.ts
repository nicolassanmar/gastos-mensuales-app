import { type SheetExpenseRecord } from "../types";
import { compareEqualRecords } from "./util";

/**  Itau separa REDIVA y compra y es complicado de entender sin juntar.*/
export const joinItauRediva = (
  records: SheetExpenseRecord[]
): SheetExpenseRecord[] => {
  const redivaRecords = records.filter((record) =>
    record.prefix.startsWith("REDIVA")
  );
  const recordsWithoutRediva = records.filter(
    (record) =>
      !redivaRecords.find((redivaRecord) =>
        compareEqualRecords(record, redivaRecord)
      )
  );

  const joinedRecords = recordsWithoutRediva
    .map((record) => {
      const relatedRedivaRecord = redivaRecords.find(
        (redivaRecord) =>
          redivaRecord.conceptWithoutPrefix === record.conceptWithoutPrefix &&
          redivaRecord.date.getTime() === record.date.getTime()
      );
      if (!relatedRedivaRecord) return record;

      // Remove the related record from the redivaRecords array, so it's not applied again.
      // This can happen if there are multiple records with the same concept and date.
      // The COMPRA and REDIVA should be next to each other so these should process as expected.
      redivaRecords.splice(redivaRecords.indexOf(relatedRedivaRecord), 1);

      return {
        ...record,
        amount: record.amount + relatedRedivaRecord.amount,
      };
    })
    .filter(Boolean);
  return joinedRecords;
};
