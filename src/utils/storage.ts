import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SheetExpenseRecord } from "./types";
import { openDB, deleteDB, wrap, unwrap, DBSchema } from "idb";

const expensesDBKey = "ExpensesDB";
const expensesStoreKey = "expenses";
const expensesQueryKey = ["expenses"];

interface ExpensesDB extends DBSchema {
  [expensesStoreKey]: {
    key: string;
    value: SheetExpenseRecord;
    indexes: { "by-date": Date; "by-currency-date": [string, Date] };
  };
}

const openExpensesDB = async () =>
  openDB<ExpensesDB>(expensesDBKey, 1, {
    upgrade(db) {
      console.log("UPGRADING DB");
      const store = db.createObjectStore(expensesStoreKey, {
        keyPath: "id",
      });
      store.createIndex("by-date", "date");
      store.createIndex("by-currency-date", ["currency", "date"]);
    },
  });

export const compute_expense_id = (expense: SheetExpenseRecord): string => {
  return `${expense.currency}-${expense.date.toISOString()}-${expense.bank}-${
    expense.concept
  }-${expense.amount}`;
};

/** Will add all the expenses to the DB. Will not create duplicate entries */
export async function writeExpensesToDB(
  expenses: SheetExpenseRecord[],
): Promise<void> {
  try {
    const db = await openExpensesDB();

    const expensesWithId = expenses.map((expense) => ({
      ...expense,
      id: compute_expense_id(expense),
    }));

    const tx = db.transaction(expensesStoreKey, "readwrite");
    const store = tx.objectStore(expensesStoreKey);

    await Promise.all([
      ...expensesWithId.map((expense) => {
        // put will update the expense if it already exists (should have the same value if this happens)
        return store.put(expense);
      }),
      tx.done,
    ]);

    console.log("Expenses written to indexedDB successfully");
  } catch (error) {
    console.error("Error writing expenses to indexedDB:", error);
  }
}

export const removeExpenseFromDB = async (id: string) => {
  try {
    const db = await openDB<ExpensesDB>(expensesDBKey, 1);
    await db.delete(expensesStoreKey, id);
  } catch (error) {
    console.error("Error removing expense from indexedDB:", error);
  }
};

const filterExpenses = (expenses: SheetExpenseRecord[]) => {
  return expenses;
  //   return expenses.filter((expense) => {
  //     if (expense.bank === "ITAU") {
  //       if (
  //         expense.concept.startsWith("CRE. CAMBIO") ||
  //         expense.concept.startsWith("DEB. CAMBIO")
  //       ) {
  //         return false;
  //       }
  //     }
  //     return expense.amount !== 0;
  //   });
};

/** React query hook to retrieve all expenses from the db */
export function useExpensesFromDB(): UseQueryResult<{
  expensesUSD: SheetExpenseRecord[];
  expensesUYU: SheetExpenseRecord[];
}> {
  return useQuery({
    queryKey: expensesQueryKey,
    queryFn: async () => {
      const db = await openExpensesDB();
      const expensesUSD = await db.getAllFromIndex(
        expensesStoreKey,
        "by-currency-date",
        IDBKeyRange.upperBound(["UYU", new Date(0)], true),
      );
      const expensesUYU = await db.getAllFromIndex(
        expensesStoreKey,
        "by-currency-date",
        IDBKeyRange.lowerBound(["USD", new Date()], true),
      );
      return {
        // return most recent expenses first
        expensesUSD: filterExpenses(expensesUSD).reverse(),
        expensesUYU: filterExpenses(expensesUYU).reverse(),
      };
    },
  });
}
