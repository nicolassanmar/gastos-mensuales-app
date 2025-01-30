"use client";
import Link from "next/link";
import { ExpensesTableWithTabs } from "~/components/expenses-table";
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
    <ExpensesTableWithTabs
      expensesUYU={data.expensesUYU}
      expensesUSD={data.expensesUSD}
    />
  );
}
