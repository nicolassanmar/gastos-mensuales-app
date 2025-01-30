"use client";
import Link from "next/link";
import { ExpensesTable } from "~/components/expenses-table";
import { useExpensesFromDB } from "~/utils/storage";

export default function HomePage() {
  const { data, isLoading } = useExpensesFromDB();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return null;
  }
  return <ExpensesTable expenses={data.expensesUYU} />;
}
