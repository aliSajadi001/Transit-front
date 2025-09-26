import React, { useState, Suspense } from "react";
import { Routes, Route } from "react-router";
import AppSidebar from "./Component/app-sidebar";
import TopNav from "./Component/top-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import LoadingPuzzle from "./Component/Spinner";
import Register from "./Pages/Register/Register";
import NotFound from "./Pages/notFound/NotFound";

// صفحات را لیزی‌لود کن
const Dashboard = React.lazy(() => import("./Pages/Dashboard/Dashboard"));
const CompaniesDataTable = React.lazy(
  () => import("./Pages/basicData/BasicData")
);
const Data = React.lazy(() => import("./Pages/dasboard/dataGrid"));
const Manifesto = React.lazy(() => import("./Pages/Manifesto/Manifesto"));
const StepWizard = React.lazy(() => import("./Pages/WizardForm/StepWizard"));

function App() {
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AppSidebar
          isDesktopOpen={isDesktopOpen}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* ستون اصلی */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav
            onToggleDesktop={() => setIsDesktopOpen((v) => !v)}
            onOpenMobile={() => setIsMobileOpen(true)}
            isDesktopOpen={isDesktopOpen}
          />

          {/* main بدون padding-top تا محتوا زیر هدر fixed حرکت کند. */}
          <main className="flex-1 overflow-auto -mt-16">
            <Toaster richColors position="top-center" />

            {/* لیزی‌لود همه‌ی مسیرها با فالبک LoadingPuzzle */}
            <Suspense fallback={<LoadingPuzzle />}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/basic-data/*" element={<CompaniesDataTable />} />
                <Route path="/" element={<Data />} />
                <Route path="/manifesto" element={<Manifesto />} />
                <Route path="/register" element={<Register />} />
                <Route path="/wizard" element={<StepWizard />} />
                <Route path="*" element={<NotFound />} />
                {/* سایر Routeها */}
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
