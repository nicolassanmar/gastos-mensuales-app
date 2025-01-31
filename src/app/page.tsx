"use client";
import Link from "next/link";
import { ExpensesTableWithTabs } from "~/components/expenses-table";
import { FileDropdown } from "~/components/file-dropdown";
import { useExpensesFromDB } from "~/utils/storage";

export default function HomePage() {
  const { data, isLoading } = useExpensesFromDB();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return null;
  }
  return (
    <div className="flex flex-col space-y-4">
      <FileDropdown />
      <ExpensesTableWithTabs
        expensesUYU={data.expensesUYU}
        expensesUSD={data.expensesUSD}
      />
    </div>
  );
}
