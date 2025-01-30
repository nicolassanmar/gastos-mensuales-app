import { Badge } from "~/components/ui/badge";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { SheetExpenseRecord } from "~/utils/types";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

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
    header: "Monto",
    cell: ({ row }) => (
      <div className="text-right">
        <ExpenseBadge amount={row.original.amount} />
      </div>
    ),
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

const PaginationControls: React.FC<{ table: Table<SheetExpenseRecord> }> = ({
  table,
}) => {
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();

  const pagesToShow = 5;
  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, startPage + pagesToShow - 1);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <Pagination className="gap-4 p-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            onClick={() => table.setPageIndex(0)}
            className={currentPage === 0 ? "opacity-50" : ""}
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>

        <PaginationPrevious
          onClick={() => table.previousPage()}
          className={table.getCanPreviousPage() ? "" : "opacity-50"}
        />
        {pageNumbers.map((pageIndex) => (
          <PaginationItem key={pageIndex}>
            <PaginationLink
              onClick={() => table.setPageIndex(pageIndex)}
              isActive={pageIndex === currentPage}
            >
              {pageIndex + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationNext
          onClick={() => table.nextPage()}
          className={table.getCanNextPage() ? "" : "opacity-50"}
        />

        <PaginationItem>
          <PaginationLink
            onClick={() => table.setPageIndex(totalPages - 1)}
            className={currentPage === totalPages - 1 ? "opacity-50" : ""}
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
export const ExpensesTable: React.FC<{ expenses: SheetExpenseRecord[] }> = ({
  expenses,
}) => {
  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  console.log("🚀 ~ table:", table.getRowModel().rows);

  return (
    <div className="bg-white">
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
      <PaginationControls table={table} />
    </div>
  );
};
