import { Badge } from "~/components/ui/badge";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { SheetExpenseRecord } from "~/utils/types";
import { motion } from "framer-motion";

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
  }),
  columnHelper.accessor("concept", {
    header: "Concepto",
  }),
  columnHelper.accessor("amount", {
    header: () => <th className="text-right">Monto</th>,
    cell: ({ row }) => <ExpenseBadge amount={row.original.amount} />,
  }),
  columnHelper.accessor("currency", {
    header: "Moneda",
  }),
  columnHelper.accessor("type", {
    header: "Tipo",
  }),
  columnHelper.accessor("bank", {
    header: "Banco",
  }),
];

export const ExpensesTable: React.FC<{ expenses: SheetExpenseRecord[] }> = ({
  expenses,
}) => {
  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  console.log("🚀 ~ table:", table.getRowModel().rows);

  return (
    <table className="min-w-full divide-y divide-gray-200">
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
                <div className="flex items-center">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
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
  );
};
