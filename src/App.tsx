import React, { Suspense } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/Layout/AppLayout";

// ═══ Lazy-loaded pages (code-splitting) ═══
const ActuView = React.lazy(() => import("./pages/ActuView"));
const FeedView = React.lazy(() => import("./pages/FeedView"));
const MessagesView = React.lazy(() => import("./pages/MessagesView"));
const MatchmakingView = React.lazy(() => import("./pages/MatchmakingView"));
const MenuView = React.lazy(() => import("./pages/MenuView"));
const ProfileView = React.lazy(() => import("./pages/ProfileView"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="w-8 h-8 border-3 border-[#E91E63] border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/actu" replace />} />
              <Route path="/actu" element={<AppLayout><ActuView /></AppLayout>} />
              <Route path="/feed" element={<AppLayout><FeedView /></AppLayout>} />
              <Route path="/matchmaking" element={<AppLayout><MatchmakingView /></AppLayout>} />
              <Route path="/messages" element={<AppLayout><MessagesView /></AppLayout>} />
              <Route path="/menu" element={<AppLayout><MenuView /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProfileView /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
