import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import PersonaSelection from "./pages/PersonaSelection";
import ChatInterface from "./pages/ChatInterface";
import AdminConfig from "./pages/AdminConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// User route protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If admin tries to access user routes, redirect to admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

// Admin route protection
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/personas" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/personas" element={<ProtectedRoute><PersonaSelection /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminConfig /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
