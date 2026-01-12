"use client";

import { useMemo, useState } from "react";
import { useExpensesFromDB } from "~/utils/storage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const noDecimalFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

const ExpenseBadge: React.FC<{ amount: number }> = ({ amount }) => (
  <Badge
    variant="outline"
    className="rounded bg-slate-700 px-2 py-1 text-right text-white"
  >
    {noDecimalFormatter.format(amount)}
  </Badge>
);

const StatisticsPage = () => {
  const { data, isLoading } = useExpensesFromDB();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2025, 0, 1), // January 1, 2025
    to: new Date(), // Current date
  });

  // Filter and aggregate expenses based on date range
  const { expensesDataUYU, expensesDataUSD, statsUYU, statsUSD } =
    useMemo(() => {
      if (!data) {
        return {
          expensesDataUYU: [],
          expensesDataUSD: [],
          statsUYU: { total: 0, average: 0, count: 0 },
          statsUSD: { total: 0, average: 0, count: 0 },
        };
      }

      const processExpenses = (expensesByMonth: typeof data.expensesUYU) => {
        // Flatten all expenses
        const allExpenses = expensesByMonth.flatMap((month) => month.expenses);

        // Filter by date range if set
        const filteredExpenses = allExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          if (dateRange.from && expenseDate < dateRange.from) return false;
          if (dateRange.to && expenseDate > dateRange.to) return false;
          return true;
        });

        // Calculate totalOutgoing for each month
        const monthlyData = new Map<string, number>();

        filteredExpenses.forEach((expense) => {
          const date = new Date(expense.date);
          const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

          // Only count compra and negative transferencias (outgoing)
          if (
            expense.type === "compra" ||
            (expense.type === "transferencia" && expense.amount < 0)
          ) {
            const current = monthlyData.get(yearMonth) ?? 0;
            // Add the expense amount (already negative, will be converted to positive for display)
            monthlyData.set(yearMonth, current + expense.amount);
          }
        });

        // Convert to array and sort by date
        const chartData = Array.from(monthlyData.entries())
          .map(([yearMonth, totalOutgoing]) => {
            const [year, month] = yearMonth.split("-");
            const date = new Date(parseInt(year!), parseInt(month!) - 1);
            return {
              yearMonth,
              date,
              displayMonth: date.toLocaleDateString("es", {
                month: "short",
                year: "numeric",
              }),
              // Convert negative values to positive for display
              totalOutgoing: Math.abs(totalOutgoing),
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        // Calculate statistics
        const totalOutgoing = chartData.reduce(
          (sum, item) => sum + item.totalOutgoing,
          0,
        );
        const monthCount = chartData.length;
        const averageMonthly = monthCount > 0 ? totalOutgoing / monthCount : 0;

        return {
          chartData,
          stats: {
            total: totalOutgoing,
            average: averageMonthly,
            count: monthCount,
          },
        };
      };

      const uyuResult = processExpenses(data.expensesUYU);
      const usdResult = processExpenses(data.expensesUSD);

      return {
        expensesDataUYU: uyuResult.chartData,
        expensesDataUSD: usdResult.chartData,
        statsUYU: uyuResult.stats,
        statsUSD: usdResult.stats,
      };
    }, [data, dateRange]);

  const handleResetDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Estadísticas de Gastos</h1>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rango de fechas:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Seleccionar rango</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {(dateRange.from ?? dateRange.to) && (
            <Button variant="ghost" size="sm" onClick={handleResetDateRange}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Tabs */}
      <Tabs defaultValue="UYU" className="w-full">
        <TabsList className="bg-white">
          <TabsTrigger value="UYU">UYU</TabsTrigger>
          <TabsTrigger value="USD">USD</TabsTrigger>
        </TabsList>

        <TabsContent value="UYU" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Total de Salidas
              </h3>
              <div className="mt-2">
                <ExpenseBadge amount={statsUYU.total} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Promedio Mensual
              </h3>
              <div className="mt-2">
                <ExpenseBadge amount={statsUYU.average} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Meses Analizados
              </h3>
              <p className="mt-2 text-2xl font-semibold">{statsUYU.count}</p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Gastos por Mes (UYU)</h2>
            {expensesDataUYU.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={expensesDataUYU}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayMonth" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value !== undefined
                        ? noDecimalFormatter.format(value)
                        : ""
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalOutgoing"
                    name="Total Salidas"
                    stroke="#334155"
                    strokeWidth={2}
                    dot={{ fill: "#334155" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">
                No hay datos para mostrar en este rango de fechas
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="USD" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Total de Salidas
              </h3>
              <div className="mt-2">
                <ExpenseBadge amount={statsUSD.total} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Promedio Mensual
              </h3>
              <div className="mt-2">
                <ExpenseBadge amount={statsUSD.average} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Meses Analizados
              </h3>
              <p className="mt-2 text-2xl font-semibold">{statsUSD.count}</p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Gastos por Mes (USD)</h2>
            {expensesDataUSD.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={expensesDataUSD}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayMonth" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value !== undefined
                        ? noDecimalFormatter.format(value)
                        : ""
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalOutgoing"
                    name="Total Salidas"
                    stroke="#334155"
                    strokeWidth={2}
                    dot={{ fill: "#334155" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">
                No hay datos para mostrar en este rango de fechas
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
