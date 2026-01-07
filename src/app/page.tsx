"use client";
import { ExpensesTableWithTabs } from "~/components/expenses-table";
import { FileDropdown } from "~/components/file-dropdown";

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-4">
      <FileDropdown />
      <ExpensesTableWithTabs />
    </div>
  );
}
