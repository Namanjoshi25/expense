import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart4, ListIcon, Plus, LogOut, User } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { Analytics } from "@/components/analytics";
import { AuthPage } from "@/components/auth/auth-page";
import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { Skeleton } from "@/components/ui/skeleton";

export function Layout() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { isLoading: expenseLoading } = useExpense();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-3 px-4 bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Expense Manager</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
        {expenseLoading ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Skeleton className="h-10 w-96" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="add" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="add" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <ListIcon className="h-4 w-4" />
                <span>View</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart4 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-4">
              <div className="max-w-md mx-auto">
                <ExpenseForm />
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <ExpenseList />
            </TabsContent>
            
            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Expense Manager</p>
        </div>
      </footer>
    </div>
  );
}