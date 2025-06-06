import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Filter, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpense, categories, paymentModes, dateFilters } from "@/contexts/ExpenseContext";
import { Expense, Category, PaymentMode } from "@/types";

export function ExpenseList() {
  const { filteredExpenses, filters, setFilters, deleteExpense } = useExpense();
  const [showFilters, setShowFilters] = useState(false);
  
  const getCategoryColor = (category: Category) => {
    const colorMap: Record<Category, string> = {
      "Rental": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Groceries": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Entertainment": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Travel": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      "Others": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    return colorMap[category];
  };
  
  const getPaymentModeColor = (mode: PaymentMode) => {
    const colorMap: Record<PaymentMode, string> = {
      "UPI": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      "Credit Card": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "Net Banking": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "Cash": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    };
    return colorMap[mode];
  };
  
  const toggleCategoryFilter = (category: Category) => {
    setFilters(prev => {
      const isSelected = prev.categories.includes(category);
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter(c => c !== category)
          : [...prev.categories, category]
      };
    });
  };
  
  const togglePaymentModeFilter = (mode: PaymentMode) => {
    setFilters(prev => {
      const isSelected = prev.paymentModes.includes(mode);
      return {
        ...prev,
        paymentModes: isSelected
          ? prev.paymentModes.filter(m => m !== mode)
          : [...prev.paymentModes, mode]
      };
    });
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Showing {filteredExpenses.length} expenses
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "flex items-center gap-1",
              (filters.categories.length > 0 || filters.paymentModes.length > 0) && "bg-primary/10"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" /> 
            Filters
            {(filters.categories.length > 0 || filters.paymentModes.length > 0) && (
              <Badge variant="secondary" className="ml-1 px-1">
                {filters.categories.length + filters.paymentModes.length}
              </Badge>
            )}
          </Button>
          
          <Select 
            value={filters.dateFilter}
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateFilter: value as any }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {dateFilters.map(filter => (
                <SelectItem key={filter} value={filter}>{filter}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      {showFilters && (
        <div className="px-6 pb-2 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge 
                  key={category} 
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategoryFilter(category)}
                >
                  {filters.categories.includes(category) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Payment Modes</h3>
            <div className="flex flex-wrap gap-2">
              {paymentModes.map(mode => (
                <Badge 
                  key={mode} 
                  variant={filters.paymentModes.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => togglePaymentModeFilter(mode)}
                >
                  {filters.paymentModes.includes(mode) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses found with the current filters.</p>
            <Button 
              variant="link" 
              onClick={() => setFilters({
                dateFilter: "This month",
                categories: [],
                paymentModes: []
              })}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Payment Mode</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium">
                      {format(parseISO(expense.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(getCategoryColor(expense.category))}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={cn(getPaymentModeColor(expense.paymentMode))}>
                        {expense.paymentMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {expense.notes}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-3">
                            <h4 className="font-medium">Delete this expense?</h4>
                            <p className="text-sm text-muted-foreground">
                              This will permanently delete this expense record.
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">Cancel</Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteExpense(expense._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}