import { Badge } from "~/components/ui/badge";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Header,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SheetExpenseRecord } from "~/utils/types";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import React, { useEffect, useMemo, useState } from "react";
import { useExpensesFromDB } from "~/utils/storage";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const noDecimalFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const ExpenseBadge: React.FC<{ amount: number }> = ({ amount }) => (
  <Badge
    // outline has no animation
    variant="outline"
    className={`text-right ${amount >= 0 ? "bg-green-500" : "bg-purple-500"} rounded px-2 py-1 text-white`}
  >
    {noDecimalFormatter.format(amount)}
  </Badge>
);

const columnHelper = createColumnHelper<SheetExpenseRecord>();

const columns = [
  columnHelper.accessor("date", {
    header: "Fecha",
    cell: ({ row }) => <div>{row.original.date.toLocaleDateString()}</div>,
    sortDescFirst: false,
  }),
  columnHelper.accessor("concept", {
    header: "Concepto",
  }),
  columnHelper.accessor("amount", {
    header: "Monto",
    cell: ({ row }) => (
      <div className="text-right">
        <ExpenseBadge amount={row.original.amount} />
      </div>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Tipo",
  }),
  columnHelper.accessor("bank", {
    header: "Banco",
  }),
];

const useExpenseSummary = (expenses: SheetExpenseRecord[]) => {
  return useMemo(() => {
    const totalCompra = expenses
      .filter((expense) => expense.type === "compra")
      .reduce((acc, expense) => acc + expense.amount, 0);
    const totalTransferencias = expenses
      .filter((expense) => expense.type === "transferencia")
      .reduce((acc, expense) => acc + expense.amount, 0);

    const totalOutgoingTransfers = expenses
      .filter(
        (expense) => expense.type === "transferencia" && expense.amount < 0,
      )
      .reduce((acc, expense) => acc + expense.amount, 0);

    const totalOutgoing = totalCompra + totalOutgoingTransfers;

    const totalCompraYTransferencias = totalCompra + totalTransferencias;

    return {
      totalCompra,
      totalOutgoingTransfers,
      totalOutgoing,
      totalTransferencias,
      totalCompraYTransferencias,
    };
  }, [expenses]);
};

const SummaryRow: React.FC<{ expenses: SheetExpenseRecord[] }> = ({
  expenses,
}) => {
  const {
    totalCompra,
    totalOutgoingTransfers,
    totalOutgoing,
    totalTransferencias,
    totalCompraYTransferencias,
  } = useExpenseSummary(expenses);

  return (
    <div className="flex flex-wrap justify-between border-b-2 bg-white p-4">
      <div className="flex gap-4">
        <span className="">Total Compras:</span>{" "}
        <ExpenseBadge amount={totalCompra} />
      </div>
      <div className="flex gap-4">
        <span className="">Total Transferencias Salientes:</span>{" "}
        <ExpenseBadge amount={totalOutgoingTransfers} />
      </div>
      <div className="flex gap-4">
        <span className="">Total Salidas:</span>{" "}
        <ExpenseBadge amount={totalOutgoing} />
      </div>
      <div className="flex gap-4">
        <span className="">Total Transferencias:</span>{" "}
        <ExpenseBadge amount={totalTransferencias} />
      </div>
      <div className="flex gap-4">
        <span className="">Total Compras y Transferencias:</span>{" "}
        <ExpenseBadge amount={totalCompraYTransferencias} />
      </div>
    </div>
  );
};

const SortIcon: React.FC<{ header: Header<SheetExpenseRecord, unknown> }> = ({
  header,
}) => {
  const onClick = () => {
    header.column.toggleSorting();
  };
  if (header.column.getIsSorted() === "asc") {
    return <ArrowUp className="h-4 w-4" onClick={onClick} />;
  }
  if (header.column.getIsSorted() === "desc") {
    return <ArrowDown className="h-4 w-4" onClick={onClick} />;
  }
  return <ArrowUpDown className="h-4 w-4" onClick={onClick} />;
};

const ExpensesTable: React.FC<{ expenses: SheetExpenseRecord[] }> = ({
  expenses,
}) => {
  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  console.log("🚀 ~ table:", table.getRowModel().rows);

  return (
    <div className="flex flex-col">
      <SummaryRow expenses={expenses} />
      {/* // TODO: Wrap in flex to fill 100% height */}
      <div className="overflow-auto bg-white ~max-h-[40rem]/[36rem]">
        <table className="min-w-full divide-y divide-gray-200 overflow-y-auto">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors duration-200 hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <SortIcon header={header} />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="transition-colors duration-200 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ExpensesTableWithTabs: React.FC = () => {
  const { data, isLoading } = useExpensesFromDB();

  const [selectedMonthYear, setSelectedMonthYear] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (data && !selectedMonthYear) {
      const latestUYUexpense = data.expensesUYU[0]?.yearMonth;
      const latestUSDexpense = data.expensesUSD[0]?.yearMonth;
      if (!latestUYUexpense && !latestUSDexpense) {
        return;
      }
      if (!latestUYUexpense) {
        setSelectedMonthYear(latestUSDexpense ?? null);
        return;
      }
      if (!latestUSDexpense) {
        setSelectedMonthYear(latestUYUexpense);
        return;
      }
      // compare the two strings and get the latest
      setSelectedMonthYear(
        latestUYUexpense > latestUSDexpense
          ? latestUYUexpense
          : latestUSDexpense,
      );
    }
  }, [data, selectedMonthYear]);

  const [selectedExpensesUYU, setSelectedExpensesUYU] = useState<
    SheetExpenseRecord[]
  >([]);

  const [selectedExpensesUSD, setSelectedExpensesUSD] = useState<
    SheetExpenseRecord[]
  >([]);

  useEffect(() => {
    if (data) {
      // TODO: Fix inefficient filtering here using a map
      setSelectedExpensesUYU(
        data.expensesUYU.find(
          (expense) => expense.yearMonth === selectedMonthYear,
        )?.expenses ?? [],
      );
      setSelectedExpensesUSD(
        data.expensesUSD.find(
          (expense) => expense.yearMonth === selectedMonthYear,
        )?.expenses ?? [],
      );
    }
  }, [selectedMonthYear, data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return null;
  }
  const { expensesUYU, expensesUSD } = data;

  // TODO: inefficient, since we are sorting all the dates when we could get the first one
  const yearMonthSet = new Set([
    ...expensesUYU.map((expense) => expense.yearMonth),
    ...expensesUSD.map((expense) => expense.yearMonth),
  ]);

  const sortedMonthYears = Array.from(yearMonthSet)
    .map((yearMonth) => ({
      key: yearMonth,
      // Use 3rd day of the month to avoid timezone issues going back to the previous month
      date: new Date(`${yearMonth}-03`),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (!sortedMonthYears[0]) {
    return <div>No expenses found</div>;
  }

  return (
    <>
      <Tabs defaultValue="UYU">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="UYU">UYU</TabsTrigger>
            <TabsTrigger value="USD">USD</TabsTrigger>
          </TabsList>

          <Select
            value={selectedMonthYear}
            defaultValue={sortedMonthYears[0].key}
            onValueChange={(value) => {
              setSelectedMonthYear(value);
            }}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Elige el mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sortedMonthYears.map((monthYear) => (
                  <SelectItem key={monthYear.key} value={monthYear.key}>
                    {monthYear.date
                      .toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                      .replace(/^\w/, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <TabsContent value="UYU">
          <ExpensesTable expenses={selectedExpensesUYU} />
        </TabsContent>
        <TabsContent value="USD">
          <ExpensesTable expenses={selectedExpensesUSD} />
        </TabsContent>
      </Tabs>
    </>
  );
};
