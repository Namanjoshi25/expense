import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <Layout />
          <Toaster />
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;