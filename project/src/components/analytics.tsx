import { useMemo } from "react";
import { parseISO, format, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpense } from "@/contexts/ExpenseContext";
import { Category } from "@/types";

interface MonthlyData {
  month: string;
  monthLabel: string;
  [key: string]: string | number;
}

export function Analytics() {
  const { expenses } = useExpense();

  const categoryColors: Record<Category, string> = {
    "Rental": "hsl(var(--chart-1))",
    "Groceries": "hsl(var(--chart-2))",
    "Entertainment": "hsl(var(--chart-3))",
    "Travel": "hsl(var(--chart-4))",
    "Others": "hsl(var(--chart-5))"
  };

  const chartData = useMemo(() => {
    if (expenses.length === 0) return [];
    
    // Get date range
    const dates = expenses.map(e => parseISO(e.date));
    const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))));
    const maxDate = endOfMonth(new Date());
    
    // Create months array
    const months: MonthlyData[] = [];
    let currentDate = minDate;
    
    while (currentDate <= maxDate) {
      const monthKey = format(currentDate, "yyyy-MM");
      const monthLabel = format(currentDate, "MMM yyyy");
      
      const monthData: MonthlyData = {
        month: monthKey,
        monthLabel,
        "Rental": 0,
        "Groceries": 0,
        "Entertainment": 0,
        "Travel": 0,
        "Others": 0,
      };
      
      months.push(monthData);
      currentDate = endOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
    
    // Aggregate expenses by month and category
    expenses.forEach(expense => {
      const date = parseISO(expense.date);
      const monthKey = format(date, "yyyy-MM");
      const monthData = months.find(m => m.month === monthKey);
      
      if (monthData) {
        monthData[expense.category] = (monthData[expense.category] as number) + expense.amount;
      }
    });
    
    return months;
  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium text-sm">{label}</p>
          <div className="space-y-1 mt-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: ₹{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const totalThisMonth = useMemo(() => {
    const thisMonth = format(new Date(), 'yyyy-MM');
    const thisMonthData = chartData.find(m => m.month === thisMonth);
    
    if (!thisMonthData) return 0;
    
    return Object.entries(thisMonthData)
      .filter(([key]) => key !== 'month' && key !== 'monthLabel')
      .reduce((sum, [_, value]) => sum + (value as number), 0);
  }, [chartData]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Monthly Expense Analytics</CardTitle>
        <CardDescription>
          {expenses.length === 0 
            ? "Add expenses to see your spending patterns" 
            : `This month's total: ₹${totalThisMonth.toFixed(2)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="space-y-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="monthLabel" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {["Rental", "Groceries", "Entertainment", "Travel", "Others"].map(
                  (category) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      stackId="a"
                      name={category}
                      fill={categoryColors[category as Category]}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  )
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}